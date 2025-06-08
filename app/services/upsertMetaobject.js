const upsertMetaObject = async (admin, fields) => {
  const handle = "sharebasket-settings";
  const type = "sharebasket-by-winsomies"; // MetaObject type

  try {
    // Step 1: Ensure MetaObject Definition exists
    const definitionCheck = await admin.graphql(
      `#graphql
        {
          metaobjectDefinitionByType(type: "sharebasket-by-winsomies") {
            id
            name
          }
        }`,
    );

    const defCheckData = await definitionCheck.json();
    const definitionExists = defCheckData.data.metaobjectDefinitionByType;

    if (!definitionExists) {
      const createDef = await admin.graphql(
        `#graphql
              mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
                metaobjectDefinitionCreate(definition: $definition) {
                  metaobjectDefinition {
                    type
                  }
                  userErrors {
                    field
                    message
                    code
                  }
                }
              }`,
        {
          variables: {
            definition: {
              name: "Share Basket Settings",
              type,
              fieldDefinitions: [
                // 🛠️ Cart Sharing Settings
                {
                  name: "Enable Cart Sharing",
                  key: "cartSharingEnabled",
                  type: "single_line_text_field",
                },
                {
                  name: "Link Expiration",
                  key: "linkExpiration",
                  type: "single_line_text_field",
                },
                {
                  name: "Require Login",
                  key: "requireLogin",
                  type: "boolean",
                },

                // 🎁 Discount Settings
                {
                  name: "Auto Apply Discount",
                  key: "autoApplyDiscount",
                  type: "boolean",
                },
                {
                  name: "Discount Code",
                  key: "discountCode",
                  type: "single_line_text_field",
                },

                // 🏷️ Text Customization
                {
                  name: "Share Button Label",
                  key: "shareButtonLabel",
                  type: "single_line_text_field",
                },
                {
                  name: "Success Message",
                  key: "successMessage",
                  type: "single_line_text_field",
                },
                {
                  name: "Intro Text",
                  key: "introText",
                  type: "multi_line_text_field",
                },
                {
                  name: "Terms Note",
                  key: "termsNote",
                  type: "multi_line_text_field",
                },
                {
                  name: "Expired Link Message",
                  key: "expiredMessage",
                  type: "single_line_text_field",
                },
                {
                  name: "Login Required Message",
                  key: "loginRequiredMessage",
                  type: "single_line_text_field",
                },

                // 🎨 Button Styling
                {
                  name: "Button Color",
                  key: "buttonColor",
                  type: "single_line_text_field",
                },
                {
                  name: "Text Color",
                  key: "textColor",
                  type: "single_line_text_field",
                },
                {
                  name: "Border Radius",
                  key: "borderRadius",
                  type: "number_integer",
                },
                {
                  name: "Share Modal Background Color",
                  key: "shareModalBackgroundColor",
                  type: "single_line_text_field",
                },
                {
                  name: "Share Modal Text Color",
                  key: "shareModalTextColor",
                  type: "single_line_text_field",
                },
                // 💳 App Plan
                {
                  name: "App Plan",
                  key: "appPlan",
                  type: "single_line_text_field",
                },
              ],
            },
          },
        },
      );

      const defResult = await createDef.json();
      if (defResult.data.metaobjectDefinitionCreate.userErrors.length > 0) {
        console.error(
          "Definition creation failed:",
          defResult.data.metaobjectDefinitionCreate.userErrors,
        );
        return {
          success: false,
          message: "Definition creation error",
          error: defResult.data.metaobjectDefinitionCreate.userErrors,
        };
      }

      console.log("MetaObject Definition created!");
    }

    // Step 2: Upsert MetaObject (create or update)
    const upsert = await admin.graphql(
      `#graphql
              mutation UpsertMetaobject($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
                metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
                  metaobject {
                    id
                    handle
                    fields {
                      key
                      value
                    }
                  }
                  userErrors {
                    field
                    message
                    code
                  }
                }
              }`,
      {
        variables: {
          handle: {
            type: type,
            handle: handle,
          },
          metaobject: {
            fields: fields,
          },
        },
      },
    );

    const upsertData = await upsert.json();
    if (upsertData.data.metaobjectUpsert.userErrors.length > 0) {
      console.error(
        "Upsert error:",
        upsertData.data.metaobjectUpsert.userErrors,
      );
      return {
        success: false,
        message: "Upsert failed",
        error: upsertData.data.metaobjectUpsert.userErrors,
      };
    }

    console.log(
      "MetaObject upserted successfully:",
      upsertData.data.metaobjectUpsert.metaobject,
    );
    return {
      success: true,
      metaobject: upsertData.data.metaobjectUpsert.metaobject,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "Unexpected error", error };
  }
};

export default upsertMetaObject;
