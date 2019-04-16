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
        this.setState({ searchValue: value });
        console.log(value, this.state.searchValue);
        var searchterm = value;
        var terms = searchterm.split(" ");
        console.log(terms);
        var comparision = 0;
        var price = 0;
        if(terms.includes('below')){
            comparision = 1;
            price = parseInt(terms[terms.indexOf('below')+1]);
        }
        else if(terms.includes('above')){
            comparision = 2;
            price = parseInt(terms[terms.indexOf('above')+1]);
        }   
        var flag;
        var searchType = terms.includes("or") ? 1 : 2; // 1 => or ,2 => and
        console.log(comparision, price, searchType);

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
                        !productTerms.includes(element.toLowerCase())
                    ) {
                        flag = false;
                    }
                });
            }
            return flag;
        });
        console.log(searchResult);
        if(comparision>0){
            var results = searchResult.filter((product)=>{

                console.log(product.price, price, comparision);
                if(comparision==1 && product.price > price){
                    return false;
                }
                if(comparision==2 && product.price < price){
                    return false;
                }
                return true;
            });
    
            this.setState({ products: results });
        }
        else this.setState({ products: searchResult });

        
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
