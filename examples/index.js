'use strict';

var React = require('react'),
    ReactDOM = require('react-dom'),
    { Router, Route, Link, browserHistory } = require('react-router'),
    DragAroundNaive = require('./_drag-around-naive/index'),
    DragAroundCustom = require('./_drag-around-custom/index'),
    DustbinSimple = require('./_dustbin-simple'),
    DustbinInteresting = require('./_dustbin-interesting'),
    SortableSimple = require('./_sortable-simple'),
    NestingSources = require('./_nesting-sources');

 var App = React.createClass({
   render() {
     return (
       <div>
         <h1>react-dnd examples (<a target='_href' href='https://github.com/RallySoftware/react-dnd/tree/master/examples'>source</a>)</h1>
         <ul>
           <li>Dustbin (<Link to='dustbin-simple'>simple</Link>, <Link to='dustbin-interesting'>interesting</Link>)</li>
           <li>Drag Around (<Link to='drag-around-naive'>naive</Link>, <Link to='drag-around-custom'>custom</Link>)</li>
           <li>Nesting (<Link to='nesting-sources'>drag sources</Link>)</li>
           <li>Sortable (<Link to='sortable-simple'>simple</Link>)</li>
         </ul>
         <hr />
         { this.props.children }
       </div>
     );
   }
 });

 ReactDOM.render((
  <Router history={ browserHistory }>
    <Route path="/" component={ App }>
      <Route path='drag-around-naive' component={ DragAroundNaive } />
      <Route path='drag-around-custom' component={ DragAroundCustom } />
      <Route path='dustbin-simple' component={ DustbinSimple } />
      <Route path='dustbin-interesting' component={ DustbinInteresting } />
      <Route path='nesting-sources' component={ NestingSources } />
      <Route path='sortable-simple' component={ SortableSimple } />
    </Route>
  </Router>
), document.getElementById('app'));
