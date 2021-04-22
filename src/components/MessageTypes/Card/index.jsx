import React, { useCallback } from 'react';
import { Card as DCard, List, ListItem } from '@chatui/core';

const Card = (props) => {
  const { msg, onMediaLoaded } = props;
  let {
    content: {
      list = [],
      banner,
    }
  } = msg;

  const handleItemClick = useCallback(
    (url) => {
      window.xgimi.navigateURL(url);
    },
    [],
  );

  const handleImgLoaded = useCallback(
    () => {
      typeof onMediaLoaded === 'function' && onMediaLoaded();
    },
    [onMediaLoaded],
  )

  return (
    <DCard style={{ width: '100%' }}>
      { banner && <img src={banner.img} alt="banner" onLoad={handleImgLoaded} onClick={() => handleItemClick(banner.url)} style={{ width: '100%' }} /> }
      <List>
        {
          list.map((item) => (
            <ListItem content={item.text} onClick={() => handleItemClick(item.url)} as="a" />
          ))
        }
      </List>
    </DCard>
  )
}

export default Card;