import React, { Component } from "react";
import { Dropdown, Card, Grid, Divider, Input } from "semantic-ui-react";
import Layout from "../components/Layout";
const superagent = require("superagent");

//Array for sorting options
const sortOptions = [
    {
        key: "Category",
        text: "Category",
        value: "subcategory"
    },
    {
        key: "Price",
        text: "Price",
        value: "price"
    },
    {
        key: "Popularity",
        text: "Popularity",
        value: "popularity"
    }
];

class JsonparserIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: props.products, //array storing all the products
            sortBy: "popularity",
            productList: [...props.products],
            loading: false,
            searchValue: "" //  the sortBy option
        };
    }

    // Method triggered when sortBy option is changed
    handleChange = (e, { name, value }) => {
        this.setState({ sortBy: value });
        //console.log(this.state.sortBy);
    };

    // Helper method for sorting function,
    GetSortOrder(prop) {
        return function(a, b) {
            if (a[prop] > b[prop]) {
                return -1;
            } else if (a[prop] < b[prop]) {
                return 1;
            }
            return 0;
        };
    }

    handleSearch = (e, { name, value }) => {
        this.setState({ searchValue: value, loading: true });
        var searchterm = value;
        var terms = searchterm.split(" ");
        var comparision = 0;
        var price = 0;
        var flag;

        if (terms.includes("below")) {
            comparision = 1;
            price = parseInt(terms[terms.indexOf("below") + 1]);
        } else if (terms.includes("above")) {
            comparision = 2;
            price = parseInt(terms[terms.indexOf("above") + 1]);
        }
        var searchType = terms.includes("or") ? 1 : 2; // 1 => or ,2 => and

        var searchResult = this.state.productList.filter(product => {
            if (searchType == 1) {
                flag = false;
                var productTerms = product.title.toLowerCase().split(" ");
                terms.forEach(element => {
                    if (
                        element != "or" &&
                        element != "and" &&
                        element != "below" &&
                        element != "above" &&
                        element != price &&
                        element.length != 0 &&
                        productTerms.includes(element.toLowerCase())
                    ) {
                        flag = true;
                    }
                });
            } else {
                flag = true;
                var productTerms = product.title.toLowerCase().split(" ");
                terms.forEach(element => {
                    if (
                        element != "or" &&
                        element != "and" &&
                        element != "below" &&
                        element != "above" &&
                        element != price &&
                        element.length != 0 &&
                        !productTerms.includes(element.toLowerCase())
                    ) {
                        flag = false;
                    }
                });
            }
            if (flag == true && comparision != 0 && price && !isNaN(price)) {
                if (comparision == 1 && product.price > price) {
                    flag = false;
                }
                if (comparision == 2 && product.price < price) {
                    flag = false;
                }
            }
            return flag;
        });
        this.setState({ products: searchResult, loading: false });
    };
    // Generates and Returns cards group
    renderCards() {
        this.state.products.sort(this.GetSortOrder(this.state.sortBy));
        const productArray = this.state.products.map(product => {
            return {
                header: product.title,
                description: `Price: INR ${product.price}`,
                meta: `Category: ${product.subcategory} | Popularity: ${
                    product.popularity
                }`
            };
        });

        return <Card.Group items={productArray} />;
    }

    render() {
        return (
            <Layout>
                <Grid>
                    <Grid.Column width={2} />
                    <Grid.Column width={14}>
                        <Grid.Row padded="vertically">
                            <span>
                                Sort Products by{" "}
                                <Dropdown
                                    inline
                                    options={sortOptions}
                                    onChange={this.handleChange}
                                    defaultValue={sortOptions[2].value}
                                />
                            </span>
                            <Divider />
                            <Input
                                placeholder="Search..."
                                loading={this.state.loading}
                                icon='search'
                                size='big'
                                onChange={this.handleSearch}
                                value={this.state.searchValue}
                            />
                            <Divider />
                        </Grid.Row>
                        <Grid.Row padded="vertically">
                            {this.renderCards()}
                        </Grid.Row>
                        <Divider />
                    </Grid.Column>
                </Grid>
            </Layout>
        );
    }
}

JsonparserIndex.getInitialProps = async () => {
    let data = await superagent.get(
        "https://s3.ap-south-1.amazonaws.com/ss-local-files/products.json"
    );
    data = JSON.parse(data.text);
    let keys = Object.keys(data.products);
    const items = keys.map(productId => {
        return {
            title: data.products[productId].title,
            price: parseInt(data.products[productId].price),
            subcategory: data.products[productId].subcategory,
            popularity: parseInt(data.products[productId].popularity)
        };
    });
    return { products: items };
};

export default JsonparserIndex;
