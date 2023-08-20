const args = [
  "1004gourmet-staging-9109678",
  35,
  "kweun123!",
  "product.template",
  "search_read",
];

const fields = [
  "id",
  "image_1920",
  "name",
  "x_studio_size",
  "list_price",
  "display_name",
  "create_date",
  "public_categ_ids",
];

const defaultGetProductsByCategoriesBody = {
  id: 35,
  params: {
    args,
    method: "execute_kw",
    service: "object",
  },
};

async function getProductsByCategories({
category,
}) {
  try {
    const limit = 20;
    const offset = 0;
    // Find all category
    const categoriesBody = {
      id: 1,
      params: {
        args: [
          "1004gourmet-staging-9109678",
          35,
          "kweun123!",
          "product.public.category",
          "search_read",
          [],
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

    // Filter category id for search params
    const categories_id = categoriesData.result
      .filter(({ name }) => name === category)
      .pop().id;

    const body = {
      ...defaultGetProductsByCategoriesBody,
      params: {
        ...defaultGetProductsByCategoriesBody.params,
        args: [
          ...defaultGetProductsByCategoriesBody.params.args,
          [[["public_categ_ids", "=", categories_id]]],
          {
            fields,
            context: { lang: 'en_US' },
            limit: limit,
            offset,
          },
        ],
      },
    };

    // Fetch related products by category id
    const allProductCategoriesResponse = await fetch(
      `https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const allProductCategoriesData = await allProductCategoriesResponse.json();

    const allProductCategories = allProductCategoriesData.result.map(
      ({
        display_name,
        image_1920,
        public_categ_ids,
        x_studio_size,
        ...product
      }) => {
        // filter products related categories name from categories list
        const categories = public_categ_ids.map((cate_id) => {
          return categoriesData.result
            .filter(({ id }) => id === cate_id)
            .pop();
        });
        return {
          display_name: display_name ? display_name : null,
          ...{
            categories,
          },
          image: image_1920 ? image_1920 : null,
          size: x_studio_size ? x_studio_size : null,
          ...product,
        };
      }
    );

    return allProductCategories;
  } catch (err) {
    // Sentry.captureException(err);
    throw new Error(`{
      message: 'Error while fetching products by categories.',
      error: ${err}
    }`);
  }
}

module.exports = getProductsByCategories;