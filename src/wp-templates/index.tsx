import page from "./page";
import single from "./single";
import category from "./category";
import tag from "./tag";
import main from "./main";
import archive from "./archive";
import universitet from "./universitet";

const templates = {
  // front page will a specifycally page
  page,
  single,
  category,
  tag,
  index: main,
  archive,
  universitet,
  // WordPress da custom post type nomi "oliygoh" bo'lgani uchun
  // GraphQL __typename "Oliygoh" (katta 'O') qaytaryapti, shuning uchun ikkalasini ham qo'shamiz
  oliygoh: universitet,
  // CRITICAL: GraphQL __typename "Oliygoh" (katta 'O') qaytaryapti
  // Faust.js __SEED_NODE__.__typename dan foydalanib template'ni topadi
  Oliygoh: universitet, // GraphQL __typename bilan mos kelishi uchun katta 'O' bilan
};

export default templates;
