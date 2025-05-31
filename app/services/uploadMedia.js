export async function getStagedUploadTarget(admin, file) {
  try {
    // Step 1: Create staged upload target
    const response = await admin.graphql(
      `#graphql
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: [
            {
              filename: file.name,
              mimeType: file.type,
              fileSize: file.size.toString(),
              resource: "IMAGE",
              httpMethod: "POST",
            },
          ],
        },
      },
    );

    const json = await response.json();
    const target = json?.data?.stagedUploadsCreate?.stagedTargets?.[0];
    const errors = json?.data?.stagedUploadsCreate?.userErrors;

    if (!target) {
      throw new Error(errors?.[0]?.message || "Failed to create staged upload target.");
    }

    // Step 2: Upload the file to the generated URL
    const uploadUrl = target.url;
    const formData = new FormData();
    target.parameters.forEach((param) => {
      formData.append(param.name, param.value);
    });
    formData.append("file", file);

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    // Check for errors in the upload response body
    const uploadText = await uploadResponse.text();
    if (!uploadResponse.ok || uploadText.includes("Error")) {
      throw new Error("File upload to Shopify failed: " + uploadText);
    }

    // Step 3: Permanently save file via fileCreate mutation
    const fileCreateResponse = await admin.graphql(
      `mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            alt
            fileStatus
            createdAt
            preview {
              status
              image {
                url
                id
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          files: [
            {
              alt: file.name || "Uploaded image",
              contentType: "IMAGE",
              originalSource: target.resourceUrl,
              duplicateResolutionMode: "APPEND_UUID"
            },
          ],
        },
      },
    );

    const fileCreateJson = await fileCreateResponse.json();
    const fileCreateErrors = fileCreateJson?.data?.fileCreate?.userErrors;
    const createdFile = fileCreateJson?.data?.fileCreate?.files?.[0];

    if (fileCreateErrors?.length) {
      throw new Error(fileCreateErrors[0].message);
    }

    // Step 4: Poll for file readiness
    let status = createdFile.fileStatus;
    let fileId = createdFile.id;
    let pollCount = 0;
    let imageUrl = createdFile.preview?.image?.url;

    while (status !== "READY" && status !== "FAILED" && pollCount < 10) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const pollRes = await admin.graphql(
        `query {
          node(id: "${fileId}") {
            ... on File {
              fileStatus
              fileErrors {
                code
                message
              }
              preview {
                image {
                  url
                }
              }
            }
          }
        }`
      );
      const pollJson = await pollRes.json();
      status = pollJson?.data?.node?.fileStatus;
      imageUrl = pollJson?.data?.node?.preview?.image?.url;
      console.log("IMage Url ", imageUrl)
      if (status === "FAILED") {
        const fileErrors = pollJson?.data?.node?.fileErrors;
        throw new Error("File processing failed: " + (fileErrors?.[0]?.message || "Unknown error"));
      }
      pollCount++;
    }

    if (status !== "READY") {
      throw new Error("File did not become ready in time.");
    }

    return {
      resourceUrl: imageUrl,
      id: fileId,
      imageUrl,
      message: "File uploaded and saved permanently.",
    };
  } catch (error) {
    throw new Error("Error while uploading and creating file. " + error.message);
  }
}