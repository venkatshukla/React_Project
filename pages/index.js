import React, { Component } from "react";
import { Dropdown, Card, Grid, Divider } from "semantic-ui-react";
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
            sortBy: "popularity" //  the sortBy option
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