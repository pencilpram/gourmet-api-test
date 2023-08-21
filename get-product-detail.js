const args = [
  "1004gourmet-staging-9109678",
  35,
  "kweun123!",
  "product.template",
  "search_read",
];

const fields = [
  "id",
  "public_categ_ids",
  "barcode",
  "name",
  "image_1920",
  "x_studio_size",
  "sale_ok",
  "standard_price",
  "korean_description",
  "description",
  "brand_id",
  "x_studio_country_of_origin",
  "x_studio_packing_1",
  "product_template_image_ids",
  "alternative_product_ids",
];

const defaultGetProductDetailBody = {
  id: 35,
  params: {
    args,
    method: "execute_kw",
    service: "object",
  },
};

async function getProductDetail(id) {
  try {
    const body = {
      ...defaultGetProductDetailBody,
      params: {
        ...defaultGetProductDetailBody.params,
        args: [
          ...defaultGetProductDetailBody.params.args,
          [[["id", "=", parseInt(id)]]],
          {
            fields,
            context: { lang: 'en_US' },
          },
        ],
      },
    };

    // Find product detail from product id
    const productDetailResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await productDetailResponse.json();
    const productDetail = data.result[0];

    // Find product image related to product
    const imageID = productDetail.product_template_image_ids;

    const productImageBody = {
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          "1004gourmet-staging-9109678",
          35,
          "kweun123!",
          "product.image",
          "search_read",
          [[["id", "=", imageID]]],
          {
            fields: [
              "id",
              "name",
              "image_1920",
              "image_1024",
              "image_512",
              "image_256",
              "image_128",
              "video_url",
            ],
          },
        ],
      },
      id: 35,
    };

    const productImageResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      method: "POST",
      body: JSON.stringify(productImageBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const productImage = await productImageResponse.json();
    const productImages = productImage.result;

    //Find category related to product
    const categoryID = productDetail.public_categ_ids;

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
          [[["id", "in", categoryID]]],
          {
            fields: ["id", "name"],
            context: { lang: 'en_US' },
          },
        ],
      },
      id: 35,
    };

    const categoriesResponse = await fetch(`https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`, {
      method: "POST",
      body: JSON.stringify(categoriesBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const categoriesData = await categoriesResponse.json();

    //Find alternative product related to product  id
    const alternativeProductID = productDetail.alternative_product_ids;

    const alternativeProductBody = {
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          "1004gourmet-staging-9109678",
          35,
          "kweun123!",
          "product.template",
          "search_read",
          [[["id", "in", alternativeProductID]]],
          {
            fields: ["id", "image_1920", "name", "x_studio_size", "list_price"],
            context: { lang: 'en_US' },
          },
        ],
      },
      id: 35,
    };

    const alternativeProductResponse = await fetch(
      `https://1004gourmet-staging-9109678.dev.odoo.com/jsonrpc`,
      {
        method: "POST",
        body: JSON.stringify(alternativeProductBody),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const alternativeProductData = await alternativeProductResponse.json();
    const alternativeProducts = alternativeProductData.result.map(
      ({ x_studio_size, image_1920, ...product }) => ({
        ...product,
        image: image_1920 ? image_1920 : null,
        size: x_studio_size ? x_studio_size : null,
      })
    );

    const productDetailData = data.result.map(
      ({
        alternative_product_ids,
        brand_id,
        description,
        image_1920,
        korean_description,
        product_template_image_ids,
        public_categ_ids,
        standard_price,
        x_studio_country_of_origin,
        x_studio_packing_1,
        x_studio_size,
        ...product
      }) => {
        const categories = categoriesData.result.filter(
          ({ id }) => public_categ_ids.includes(id)
        );
        return {
          alternative_products: alternativeProducts,
          brand: brand_id ? brand_id[1] : null,
          ...{
            categories,
          },
          country_of_origin: x_studio_country_of_origin
            ? x_studio_country_of_origin[1]
            : null,
          description: description ? description : null,
          image_1920: image_1920 ? image_1920 : null,
          images: productImages,
          korean_description: korean_description ? korean_description : null,
          ...{ packing: x_studio_packing_1 ? x_studio_packing_1 : null },
          ...{ size: x_studio_size ? x_studio_size : null },
          standard_price: standard_price ? standard_price : null,
          ...product,
        };
      }
    );

    return productDetailData;
  } catch (err) {
    // Sentry.captureException(err);
    throw new Error(`{
      message: 'Error while fetching product detail.',
      error: ${err}
    }`);
  }
}

module.exports = getProductDetail;