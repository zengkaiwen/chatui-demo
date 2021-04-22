import React from 'react';
import { Card, List as ListComp, ListItem } from '@chatui/core';


const List = ({ msg }) => {
  const { content = { list: [] } } = msg;
  const { list } = content;

  function handleSend(e, url) {
    window.xgimi.navigateURL(url);
    e.preventDefault();
  }

  return (
    <Card style={{ width: '100%' }}>
      <ListComp>
        {
          list.map((item) => (
            <ListItem key={item.text} as="a" content={item.text} onClick={(e) => handleSend(e, item.url)} />
          ))
        }
      </ListComp>
    </Card>
  )
}

export default List;
