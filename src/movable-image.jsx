define(function(require) {
  var React = require('react');
  var Hammer = require('hammer');

  var MovableImage = React.createClass({
    getInitialState: function() {
      return {
        movingImage: null
      };
    },
    componentDidMount: function() {
      var image = this.refs.image.getDOMNode();
      var hammer = this.hammer = new Hammer(image);
      hammer.on('panmove', function(e) {
        this.setState({
          movingImage: {
            x: this.props.x + e.deltaX,
            y: this.props.y + e.deltaY
          }
        });
      }.bind(this));
      hammer.on('panend', function(e) {
        var movingImage = this.state.movingImage;
        this.props.firebaseRef.update({
          x: movingImage.x,
          y: movingImage.y
        });
        this.setState({movingImage: null});
      }.bind(this));
    },
    componentWillUnmount: function() {
      this.hammer.destroy();
      this.hammer = null;
    },
    render: function() {
      var coords = this.state.movingImage || this.props;
      var style = {
        position: 'absolute',
        top: coords.y,
        left: coords.x
      };

      return <img ref="image" style={style} src={this.props.url} width={this.props.width} height={this.props.height}/>;
    }
  });

  return MovableImage;
});
