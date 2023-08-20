// import { getLocaleMapping } from "@/back-end/utils/get-locale-mapping";
// import * as Sentry from "@sentry/nextjs";
const shuffle = require("lodash/shuffle");
const compact = require("lodash/compact");

const args = [
  "1004gourmet-staging-9109678",
  35,
  "kweun123!",
  "product.template",
  "search_read",
  [[["product_tag_ids", "=", "On Sale"]]],
];

const fields = [
  "id",
  "image_1920",
  "name",
  "currency_id",
  "list_price",
  "default_code",
  "x_studio_size",
  "display_name",
  "description",
  "public_categ_ids",
  "product_tag_ids",
  "website_ribbon_id",
  "x_studio_expire_date",
];

const defaultGetOnSaleProductsBody = {
  id: 35,
  params: {
    args,
    method: "execute_kw",
    service: "object",
  },
};

async function getOnSaleProducts() {
  try {
    const limit = 1;
    const offset = 0;
    const body = {
      ...defaultGetOnSaleProductsBody,
      params: {
        ...defaultGetOnSaleProductsBody.params,
        args: [
          ...defaultGetOnSaleProductsBody.params.args,
          {
            context: { lang: 'en_US' },
            fields,
            limit,
            offset,
          },
        ],
      },
    };

    const onSaleProductResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const onSaleProductsdata = await onSaleProductResponse.json();

    //Find tag name related to product
    const tagIds = onSaleProductsdata.result[0].product_tag_ids;

    const onSaleTagBody = {
      id: 35,
      params: {
        args: [
          "1004gourmet-staging-9109678",
          35,
          "kweun123!",
          "product.tag",
          "search_read",
          [[["id", "in", tagIds]]],
          {
            fields: ["id", "name"],
          },
        ],
        method: "execute_kw",
        service: "object",
      },
    };

    const onSaleTagResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      body: JSON.stringify(onSaleTagBody),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const tagResponse = await onSaleTagResponse.json();

    //Find category name related to product
    const categories_ids = onSaleProductsdata.result[0].public_categ_ids;

    const categoriesBody = {
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          "1004gourmet-staging-9109678",
          35,
          "kweun123!",
          "product.public.category",
          "search_read",
          [[["id", "in", categories_ids]]],
          {
            fields: ["id", "name"],
          },
        ],
      },
      id: 1,
    };

    const categoriesResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoriesBody),
    });

    const categories_data = await categoriesResponse.json();

    const onSaleProducts = onSaleProductsdata.result.map(
      ({
        currency_id,
        default_code,
        description,
        display_name,
        image_1920,
        list_price,
        product_tag_ids,
        public_categ_ids,
        website_ribbon_id,
        x_studio_expire_date,
        x_studio_size,
        ...products
      }) => {
        const tags = tagResponse.result.map(
          ({ id, name }) => {
            if (product_tag_ids.includes(id)) {
              return { id, name };
            }
          }
        );
        const categories = categories_data.result.map(
          ({ id, name }) => {
            if (public_categ_ids.includes(id)) {
              return { id, name };
            }
          }
        );

        return {
          currency_unit: currency_id ? currency_id[1] : null,
          default_code: default_code ? default_code : null,
          description: description ? description : null,
          display_name: display_name ? display_name : null,
          expire_date: x_studio_expire_date ? x_studio_expire_date : null,
          image: image_1920 ? image_1920 : null,
          is_added_to_wishlist: shuffle([true, false])[0],
          list_price: list_price ? list_price : null,
          ribbon_text: {
            id: website_ribbon_id ? website_ribbon_id[0] : null,
            name: website_ribbon_id ? website_ribbon_id[1] : null,
            type: "secondary",
          },
          sizes: x_studio_size ? x_studio_size : null,
          tags: compact(tags),
          ...{
            categories: compact(categories),
          },
          ...products,
        };
      }
    );

    return onSaleProducts;
  } catch (err) {
    // Sentry.captureException(err);
    throw new Error(`{
      message: 'Error while fetching on sale products.',
      error: ${err}
    }`);
  }
}

module.exports = getOnSaleProducts;