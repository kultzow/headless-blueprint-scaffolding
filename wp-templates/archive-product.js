import { gql, useQuery } from "@apollo/client";
import { getNextStaticProps } from "@faustwp/core";
import dynamic from "next/dynamic";
import Head from "next/head";
import Header from "../components/Header";
import EntryHeader from "../components/EntryHeader";
import Footer from "../components/Footer";
import style from "../styles/front-page.module.css";

import { SITE_DATA_QUERY } from "../queries/SiteSettingsQuery";
import { HEADER_MENU_QUERY } from "../queries/MenuQueries";

const ProductCategoryAccordion = dynamic(
  () => import("../components/ProductCategoryAccordion"),
  { ssr: false }
);

const PRODUCTS_QUERY = gql`
  query GetProducts {
    products(first: 100, where: { status: "publish" }) {
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
           productCategories {
            nodes {
              name
            }
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

export default function ArchiveProduct(props) {
  
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }


  const siteDataQuery = useQuery(SITE_DATA_QUERY) || {};
  const headerMenuDataQuery = useQuery(HEADER_MENU_QUERY) || {};

  const siteData = siteDataQuery?.data?.generalSettings || {};
  const menuItems = headerMenuDataQuery?.data?.primaryMenuItems?.nodes || {
    nodes: [],
  };
  const { title: siteTitle, description: siteDescription } = siteData;
  
  const { data, loading, error } = useQuery(PRODUCTS_QUERY);

  if (loading && !data) return <div className="container mx-auto py-20 text-center">Loading...</div>;
  if (error) return <p>Error: {error.message}</p>;

  const allProducts = data?.products?.nodes ?? [];
  const products = allProducts.filter(
    (p) => !p.productCategories?.nodes?.some((c) => c.name === 'Custom')
  );

  const categoryMap = {};
  products.forEach((product) => {
    const cats = product.productCategories?.nodes ?? [];
    const logProduct = JSON.stringify(product, null, 2);
    const names = cats.length ? cats.map((c) => c.name) : ['Uncategorized'];
    names.forEach((name) => {
      if (!categoryMap[name] || categoryMap[name]=='Unique') categoryMap[name] = [];
      categoryMap[name].push(product);
    });
  });
  const categories = Object.keys(categoryMap).sort();

  return (
    <>
      <Head><title>Shop</title></Head>
      <Header
              siteTitle={siteTitle}
              siteDescription={siteDescription}
              menuItems={menuItems}
            />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shop</h1>
        {!products.length && <p>No products found.</p>}
        <ProductCategoryAccordion categoryMap={categoryMap} categories={categories} />
      </main>
    </>
  );
}

ArchiveProduct.queries = [{ query: PRODUCTS_QUERY }];

export async function getStaticProps(context) {
  return getNextStaticProps(context, {
    Page: ArchiveProduct,
    revalidate: 60,
  });
}
