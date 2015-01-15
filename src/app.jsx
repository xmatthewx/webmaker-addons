define(function(require) {
  var _ = require('underscore');
  var React = require('react');
  var SelectionFrame = require('jsx!./selection-frame');
  var Fonts = require('jsx!./fonts');
  var ExportModal = require('jsx!./export-modal');
  var itemUtils = require('./item-utils');
  var ScaleSizer = require('jsx!./scale-sizer');
  var TypeMap = require('./type-map');
  var PrimaryToolbar = require('jsx!./primary-toolbar');
  var SelectionToolbar = require('jsx!./selection-toolbar');

  var App = React.createClass({
    getInitialState: function() {
      return {
        selectedItem: null,
        selectedItemDOMNode: null,
        showExportModal: false,
        items: null
      };
    },
    componentWillMount: function() {
      this.props.firebaseRef.on("value", this.handleFirebaseRefValue);
    },
    componentWillUnmount: function() {
      this.props.firebaseRef.off("value", this.handleFirebaseRefValue);
    },
    handleFirebaseRefValue: function(snapshot) {
      var items = snapshot.val() || {};
      var selectedItem = this.state.selectedItem;

      if (selectedItem && !(selectedItem in items))
        this.clearSelection();

      this.setState({items: items});
    },
    toggleExportModal: function() {
      this.setState({showExportModal: !this.state.showExportModal});
    },
    getExportHtml: function() {
      return React.renderToStaticMarkup(
        <html>
          <head>
            <meta charSet="utf-8"/>
            {Fonts.createLinkElements(itemUtils.getFontList(this.state.items),
                                      'https:')}
          </head>
          <body>
            {this.createItems(false)}
          </body>
        </html>
      );
    },
    handleItemsFrameClick: function(e) {
      if (e.target === e.currentTarget)
        this.clearSelection();
    },
    handleItemSelect: function(key, e) {
      this.setState({
        selectedItem: key,
        selectedItemDOMNode: e.target
      });
    },
    clearSelection: function() {
      this.setState({
        selectedItem: null,
        selectedItemDOMNode: null
      });
    },
    getPointerScale: function() {
      return this.refs.scaleSizer.getPointerScale();
    },
    createItem: function(isEditable, key) {
      var item = this.state.items[key];
      var itemsRef = this.props.firebaseRef;

      if (item && item.type && item.type in TypeMap)
        return React.createElement(
          TypeMap[item.type].ContentItem,
          _.extend({}, TypeMap[item.type].DEFAULT_PROPS, item.props, {
            key: key,
            getPointerScale: this.getPointerScale,
            isEditable: isEditable,
            isSelected: isEditable && this.state.selectedItem == key,
            onSelect: this.handleItemSelect.bind(this, key),
            firebaseRef: itemsRef.child(key).child('props')
          })
        );
      return <div key={key}><code>??? {key} ???</code></div>;
    },
    createItems: function(isEditable) {
      var orderedKeys = itemUtils.getOrderedKeys(this.state.items || {});

      return (
        <div style={{
          position: 'relative',
          width: this.props.canvasWidth,
          height: this.props.canvasHeight,
          border: '1px dotted lightgray',
          overflow: 'hidden'
        }} onClick={this.handleItemsFrameClick} onTouchStart={this.handleItemsFrameClick}>
        {orderedKeys.map(this.createItem.bind(this, isEditable))}
        </div>
      );
    },
    createExportModal: function() {
      if (!this.state.showExportModal) return null;
      return <ExportModal html={this.getExportHtml()} onClose={this.toggleExportModal}/>;
    },
    render: function() {
      return (
        <div>
          <PrimaryToolbar ref="primaryToolbar" canvasWidth={this.props.canvasWidth} canvasHeight={this.props.canvasHeight} firebaseRef={this.props.firebaseRef} onExport={this.toggleExportModal}/>
          <ScaleSizer ref="scaleSizer" width={this.props.canvasWidth} height={this.props.canvasHeight}>
            {this.createItems(true)}
          </ScaleSizer>
          <SelectionFrame selection={this.state.selectedItemDOMNode}/>
          <Fonts fonts={itemUtils.getFontList(this.state.items)}/>
          <SelectionToolbar selectedItem={this.state.selectedItem} items={this.state.items} firebaseRef={this.props.firebaseRef}/>
          {this.createExportModal()}
        </div>
      );
    }
  });

  return App;
});
