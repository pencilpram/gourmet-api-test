/* eslint-disable sort-keys */
// import type { IGetCategoriesParams, IGetCategoriesData } from "./types";
// import { deserializeData } from "@/back-end/utils/nested-serializer";
const deserializeData = require("/lib/nested-serializer");
// import deserializeData from "./lib/nested-serializer";

const args = [
  "1004gourmet-staging-9109678",
  35,
  "kweun123!",
  "product.public.category",
  "search_read",
  [],
];

const fields = ["id", "image_256", "name", "parent_id"];

const defaultGetCategoriesBody = {
  id: 35,
  params: {
    args,
    method: "execute_kw",
    service: "object",
  },
};

async function getCategories() {
  try {
    const body = {
      ...defaultGetCategoriesBody,
      params: {
        ...defaultGetCategoriesBody.params,
        args: [
          ...defaultGetCategoriesBody.params.args,
          {
            fields,
            context: { lang: "en_US" },
          },
        ],
      },
    };

    const allCategoriesResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const allCategories = await allCategoriesResponse.json();

    return deserializeData(allCategories.result);

    // return allCategories.result;
  } catch (err) {
    // Sentry.captureException(err);
    throw new Error(`{
      message: 'Error while fetching categories',
      error: ${err}
    }`);
  }
}

module.exports = getCategories;
