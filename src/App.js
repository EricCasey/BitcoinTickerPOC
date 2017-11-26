import React, { Component } from 'react';
import './App.css';
import socketCluster from 'socketcluster-client';

const {Chart, Dots, Lines, Ticks} = require('rumble-charts');

var api_credentials = {
      "apiKey"    : "x",
      "apiSecret" : "x"
    }

var options = {
      hostname  : "sc-02.coinigy.com",
      port      : "443",
      secure    : "true"
  };

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      priceData : [ ],
      currentPrice: 0,
      count: 0,
      firstPrice: 0
    }
  };

  componentDidMount() {
    var SCsocket = socketCluster.connect(options);
    SCsocket.on('connect', function (status) {
        // console.log(status);
        SCsocket.on('error', function (err) {
            console.log(err);
        });
        SCsocket.emit("auth", api_credentials, function (err, token) {
            if (!err && token) {
                var scChannel = SCsocket.subscribe("BD411A5E-2591-C59A-CD9A-C3DCC2905F42");
                //console.log(scChannel);
                scChannel.watch(function (data) {
                    console.log(data.Data[0].last_price);
                    if(this.state.firstPrice === 0) {
                      this.setState({
                        firstPrice: data.Data[0].last_price
                      })
                    }
                    var lastBTCUSDprice = data.Data[0].last_price;
                    var currentCount = this.state.count + 1
                    this.setState({
                      currentPrice: data.Data[0].last_price,
                      count: currentCount,
                      priceData: this.state.priceData.concat(
                        lastBTCUSDprice
                      )
                    })
                    console.log(this.state)
                }.bind(this));
            } else {
                console.log("error " + err)
            }
        }.bind(this));
    }.bind(this));
  }

  render() {

    return (
      <div className="App">
        <div className="App-header">
          <img src="https://xtreambit.net/wp-content/uploads/2017/05/bit-pesado.gif" className="App-logo" alt="logo" />
          <h2>Eric's Real-Time Websockets BTC/USD Ticker</h2>
        </div>
        <div className="btcprice">
          <div id="point">
            last BTC/USD price: {this.state.currentPrice.toFixed(2)}
          </div>
          <div id="count">
            Count: {this.state.count}
          </div>
          <div id="firstPrice">
            FirstPrice: {this.state.firstPrice}
          </div>
          <div id="delta">
            Delta Since First Load: {((this.state.currentPrice-this.state.firstPrice)/this.state.firstPrice*100).toFixed(2)}%
          </div>
          <div>
            <Chart
              className="chart"
              width={500}
              height={300}
              series={[{ data: this.state.priceData }]}
              minY={(this.state.currentPrice/2).toFixed(0)}
              maxY={5000}>
              <Ticks
                axis='y'
                ticks={{maxTicks: 10}}
                lineLength='100%'
                lineVisible={true}
                lineStyle={{stroke:'lightgray'}}
                labelStyle={{textAnchor:'end',alightmentBaseline:'middle',fontSize:'0.6em',fill:'black'}}
                labelAttributes={{x: -5}}
              />
              <Lines />
              <Dots />
            </Chart>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
