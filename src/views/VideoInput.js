import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Webcam from "react-webcam";
import { loadModels, getFullFaceDescription, createMatcher } from "../api/face";
import ProductList from "../components/ProductList";
import Title from "../components/Title";
import { ProductConsumer } from "../context";
import Product from "../components/Product";

// Import face profile
const JSON_PROFILE = require("../descriptors/bnk48.json");

const WIDTH = 120;
const HEIGHT = 120;
const inputSize = 160;

class VideoInput extends Component {
  constructor(props) {
    super(props);
    this.webcam = React.createRef();
    this.state = {
      fullDesc: null,
      detections: null,
      descriptors: null,
      faceMatcher: null,
      match: null,
      facingMode: null,
      expressions: null,
      angry: null,
      disgusted: null,
      fearful: null,
      happy: null,
      neutral: null,
      sad: null,
      surprised: null,

      max: null,
      emotion: null,
    };
  }

  componentWillMount = async () => {
    await loadModels();
    this.setState({ faceMatcher: await createMatcher(JSON_PROFILE) });
    this.setInputDevice();
  };

  setInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      let inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (inputDevice.length < 2) {
        await this.setState({
          facingMode: "user",
        });
      } else {
        await this.setState({
          facingMode: { exact: "environment" },
        });
      }
      this.startCapture();
    });
  };

  startCapture = () => {
    this.interval = setInterval(() => {
      this.capture();
    }, 1500);
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  capture = async () => {
    if (!!this.webcam.current) {
      await getFullFaceDescription(
        this.webcam.current.getScreenshot(),
        inputSize
      ).then((fullDesc) => {
        if (!!fullDesc) {
          this.setState({
            detections: fullDesc.map((fd) => fd.detection),
            descriptors: fullDesc.map((fd) => fd.descriptor),
            expressions: fullDesc.map((fd) => fd.expressions),
          });
        }
      });
      this.state.angry = this.state.expressions.map((fd) => fd.angry);
      this.state.disgusted = this.state.expressions.map((fd) => fd.disgusted);
      this.state.fearful = this.state.expressions.map((fd) => fd.fearful);
      this.state.happy = this.state.expressions.map((fd) => fd.happy);
      this.state.neutral = this.state.expressions.map((fd) => fd.neutral);
      this.state.sad = this.state.expressions.map((fd) => fd.sad);
      this.state.surprised = this.state.expressions.map((fd) => fd.surprised);
      //console.log("angry => " + this.state.angry);
      //console.log("disgusted => " + this.state.disgusted);
      //console.log("fearful => " + this.state.fearful);
      //console.log("happy => " + this.state.happy);
      //console.log("neutral => " + this.state.neutral);
      //console.log("sad => " + this.state.sad);
      //console.log("surprised => " + this.state.surprised);

      this.state.max = Math.max(
        this.state.angry,
        this.state.disgusted,
        this.state.fearful,
        this.state.happy,
        this.state.neutral,
        this.state.sad,
        this.state.surprised
      );
      if (this.state.max == this.state.neutral) {
        this.state.emotion = "neutral";
        console.log(this.state.emotion);
      } else if (this.state.max == this.state.disgusted) {
        this.state.emotion = "disgusted";
        console.log(this.state.emotion);
      } else if (this.state.max == this.state.fearful) {
        this.state.emotion = "fearful";
        console.log(this.state.emotion);
      } else if (this.state.max == this.state.happy) {
        this.state.emotion = "happy";
        console.log(this.state.emotion);
      } else if (this.state.max == this.state.angry) {
        this.state.emotion = "angry";
        console.log(this.state.emotion);
      } else if (this.state.max == this.state.sad) {
        this.state.emotion = "sad";
        console.log(this.state.emotion);
      } else if (this.state.max == this.state.surprised) {
        this.state.emotion = "surprised";
        console.log(this.state.emotion);
      } else {
        console.log("error");
      }

      //console.log("max =>"+this.state.max);

      if (!!this.state.descriptors && !!this.state.faceMatcher) {
        let match = await this.state.descriptors.map((descriptor) =>
          this.state.faceMatcher.findBestMatch(descriptor)
        );
        this.setState({ match });
      }
    }
  };

  render() {
    const { detections, facingMode, emotion } = this.state;
    let videoConstraints = null;
    let camera = "";
    if (!!facingMode) {
      videoConstraints = {
        width: WIDTH,
        height: HEIGHT,
        facingMode: facingMode,
      };
      if (facingMode === "user") {
        camera = "Front";
      } else {
        camera = "Back";
      }
    }

    let drawBox = null;
    if (!!detections) {
      drawBox = detections.map((detection, i) => {
        let _H = detection.box.height;
        let _W = detection.box.width;
        let _X = detection.box._x;
        let _Y = detection.box._y;
        return (
          <div key= {i}>
            <div
              style={{
                position: "absolute",
                border: "solid",
                borderColor: "transparent",
                height: _H,
                width: _W,
                transform: `translate(${_X}px,${_Y}px)`,
              }}
            >
              <p>{/*emotion*/}</p>
            </div>
          </div>
        );
      });
    }

    return (
      <div
        className="Camera"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {emotion}
        <div className="row" style={{ padding: "20px" }}>
          <ProductConsumer>
            {(value) => {
              if (emotion == "happy") {
                {
                  return value.products.map((product) => {
                    return <Product key={product.id} product={product} />;
                  });
                }
              } else if (emotion == "surprised") {
                return value.products.map((product) => {
                  return <Product key={product.id} product={product} />;
                });
              }
            }}
          </ProductConsumer>
        </div>
        {/*<p>Camera: {camera}</p>*/}
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
          }}
        >
          <div style={{ position: "relative", width: WIDTH }}>
            {!!videoConstraints ? (
              <div style={{ position: "absolute" }}>
                <Webcam
                  audio={false}
                  width={WIDTH}
                  height={HEIGHT}
                  ref={this.webcam}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                />
              </div>
            ) : null}
            {!!drawBox ? drawBox : null}
          </div>
        </div>
        <Title name="U are " title={emotion} />
        <div className="py-5">
          <div className="container"></div>
        </div>
      </div>
    );
  }
}

export default withRouter(VideoInput);
//7676213567
/*style = {{
  backgroundColor: "blue",  
  border: "solid",  
  borderColor: "blue",  
  width: _W,  
  marginTop: 0, 
  color: "#fff",  
  //transform: `translate(-3px,${_H}px)`,  
  }}*/
