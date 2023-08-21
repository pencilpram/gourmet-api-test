/* eslint-disable sort-keys */
const get = require("lodash/get");
const filter = require("lodash/filter");
// import _ from "lodash";
// import type { IGetCategoriesData } from "@/back-end/repositories/categories";

const deserializeData = (jsonData) => {
  jsonData.forEach((item) => {
    if (typeof item.parent_id === "number") {
      item.parent_id = [item.parent_id];
    }
  });

  // Build the parent-child relationship map using lodash functions
  const arrayMap = [];

  jsonData.forEach((item) => {
    const parentId = get(item, "parent_id[0]", item.id);

    const node = {
      id: item.id,
      name: item.name,
      parent_id: parentId === item.id ? false : parentId,
      children: [],
    };

    arrayMap[item.id] = node;

    if (parentId !== item.id) {
      const parentObj = arrayMap[parentId];
      if (
        !parentObj.children.some(
          (child) => child.id === item.id
        )
      ) {
        parentObj.children.push(node);
      }
    }
  }, {});

  return filter(arrayMap, (item) => item?.parent_id === false);
};

exports = { deserializeData } ;
