/* eslint-disable sort-keys */
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
  [[["product_tag_ids", "=", "New Arrivals"]]],
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

const defaultGetNewArrivalProductsBody = {
  id: 35,
  params: {
    args,
    method: "execute_kw",
    service: "object",
  },
};

async function getNewArrivalsProducts() {
  try {
    const limit = 1;
    const offset = 0;
    const body = {
      ...defaultGetNewArrivalProductsBody,
      params: {
        ...defaultGetNewArrivalProductsBody.params,
        args: [
          ...defaultGetNewArrivalProductsBody.params.args,
          {
            fields,
            context: { lang: 'en_US' },
            limit,
            offset,
          },
        ],
      },
    };

    const newArrivalProductResponse = await fetch(
      `https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const newArrivalProductsData = await newArrivalProductResponse.json();
    const news = newArrivalProductsData.result;
    const categories_ids = newArrivalProductsData.result.public_categ_ids;
    const tags_ids = newArrivalProductsData.result.product_tag_ids;

    const categoriesBody = {
      id: 1,
      params: {
        args: [
          "1004gourmet-staging-9109678",
          35,
          "kweun123!",
          "product.public.category",
          "search_read",
          [[["id", "in", categories_ids]]],
          {
            fields: ["id", "name"],
            context: { lang: 'en_US' },
          },
        ],
        method: "execute_kw",
        service: "object",
      },
    };

    const categoriesResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoriesBody),
    });

    const categoriesData = await categoriesResponse.json();

    const tagsBody = {
      id: 1,
      params: {
        args: [
          "1004gourmet-staging-9109678",
          35,
          "kweun123!",
          "product.tag",
          "search_read",
          [[["id", "in", tags_ids]]],
          {
            fields: ["id", "name"],
            context: { lang: 'en_US' },
          },
        ],
        method: "execute_kw",
        service: "object",
      },
    };

    const tagsResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tagsBody),
    });

    const tagsData = await tagsResponse.json();

    //Fetch Ribbon Text
    // const ribbonId = news.website_ribbon_id[0];
    // console.log(ribbonId);

    const newArrivalProducts = newArrivalProductsData.result.map(
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
        const categories = categoriesData.result.map(
          ({ id, name }) => {
            if (public_categ_ids.includes(id)) {
              return { id, name };
            }
          }
        );
        const tags = tagsData.result.map(
          ({ id, name }) => {
            if (product_tag_ids.includes(id)) {
              return { id, name };
            }
          }
        );

        return {
          currency_unit: currency_id ? currency_id[1] : null,
          default_code: default_code ? default_code : null,
          description: description ? description : null,
          display_name: display_name ? display_name : null,
          expired_date: x_studio_expire_date ? x_studio_expire_date : null,
          image: image_1920 ? image_1920 : null,
          is_added_to_wishlist: shuffle([true, false])[0],
          list_price: list_price ? list_price : null,
          ribbon_text: {
            id: website_ribbon_id ? website_ribbon_id[0] : null,
            name: website_ribbon_id ? website_ribbon_id[1] : null,
            type: "primary",
          },
          size: x_studio_size ? x_studio_size : null,
          tags: compact(tags),
          ...{
            categories: compact(categories),
          },
          ...products,
        };
      }
    );

    return newArrivalProducts;
  } catch (err) {
    // Sentry.captureException(err);
    throw new Error(`{
      message: "Error while fetching new arrival products.",
      error: ${err}
      }`);
  }
}

module.exports = getNewArrivalsProducts;