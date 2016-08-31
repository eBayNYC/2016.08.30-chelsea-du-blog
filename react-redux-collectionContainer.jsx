import React from "react";
import { connect } from 'react-redux';
import Dragggable from 'react-draggable';

import { Row, Col, Input} from "react-bootstrap";

const Collection = React.createClass({
  maybeInsertMediaElements: function (index, coverImageUrl) {
    if (index == "1") {
      return (
        <div className="row" style={{padding: "7px"}}>
          <Col xsOffset={1}>
            <Input standalone
              type="text"
              label="Image URL"
              labelClassName="col-xs-2"
              defaultValue={coverImageUrl}
              wrapperClassName="col-xs-3" />
            <Input standalone
              type="text"
              label="Vimeo ID"
              labelClassName="col-xs-2"
              wrapperClassName="col-xs-2" />
          </Col>
        </div>
      )
    }
    return null
  },
  percolateUntil: function (el, targetClassName) {
    if (el.classList.contains(targetClassName))
      return el
    else
      return this.percolateUntil(el.parentElement, targetClassName)
  },
  calculatePlacement: function (el) {
    var elements = document.getElementsByClassName('react-draggable')
    Object.keys(elements).map( function (key) {
      var el = elements[key]
      console.log('clientTop ', el.clientTop)
      console.log('bound client ', el.getBoundingClientRect().top)
    } )
  },
  getPlacement: function(draggableElem) {
    const labelElem = draggableElem.firstChild.children[1].firstChild;
    const placement = parseInt(labelElem.getAttribute('data-placement'));
    return placement
  },
  handleStart: function (event, ui) {
    console.log('>->->->->->->->->->>');
    const draggableElem = this.percolateUntil(event.target, 'react-draggable')
    const placement = this.getPlacement(draggableElem)
    console.log('Event: ', event);
    console.log('Position: ', ui.position);
    this.startPlacement = placement
  },
  handleStop: function (event, ui) {
    console.log('--------------------');
    const draggableElem = this.percolateUntil(event.target, 'react-draggable')
    const placement = this.getPlacement(draggableElem)
    console.log('Event: ', event);
    console.log('Position: ', ui.position);
    this.stopPlacement = placement
    if (this.startPlacement !== this.stopPlacement)
      this.props.swapCollections(this.props.env, this.startPlacement, this.stopPlacement)
  },
  render: function() {
    const index = parseInt(this.props.index);
    const placement = index + 1;
    const collection = this.props.collection.collection;
    const coverImageUrl = collection ? collection.coverImageUrl : "";
    const collectionId = collection ? collection.collectionId : "";

    const collectionTitle = this.props.collection.longTitle || "";
    const highlightStyle = {
      backgroundColor: placement % 2 === 0 ? "#00000" : "#f6f6f6"
    };
    return (
      <Dragggable
        axis="y"
        onStart={this.handleStart}
        zIndex={-1}
        onStop={this.handleStop} >
        <div className="row" style={highlightStyle} >
          <div className="row" style={{padding: "7px"}}>
            <Input standalone type="text" data-placement={placement} label={"Placement " + placement} labelClassName="col-xs-2" wrapperClassName="col-xs-3" defaultValue={collectionId}/>
            <Input standalone type="text" wrapperClassName="col-xs-6" defaultValue={collectionTitle}/>
          </div>
          {this.maybeInsertMediaElements(placement, coverImageUrl)}
        </div>
      </Dragggable>
    );
  }
});


export default Collection;
