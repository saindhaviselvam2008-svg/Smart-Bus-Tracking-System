export const getLostItems = () => {
  return JSON.parse(localStorage.getItem("lostItems")) || [];
};

export const saveLostItems = (items) => {
  localStorage.setItem(
    "lostItems",
    JSON.stringify(items)
  );
};