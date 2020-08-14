import React, { Component } from "react";
import Product from "./Product";
import Title from "./Title";

import { ProductConsumer } from "../context";
export default class ProductList extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="py-5">
          <div className="container"></div>
    {/*<Title name="U are " title="HAPPY" />*/}

          <div className="row" style={{ padding: "20px" }}>
            <ProductConsumer>
              {(value) => {
                return value.products.map((product) => {
                  return <Product key={product.id} product={product} />;
                });
              }}
            </ProductConsumer>
          </div>
        </div>
      </React.Fragment>
      //<Product />
    );
  }
}
