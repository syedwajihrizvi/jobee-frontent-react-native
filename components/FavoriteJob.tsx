import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

const FavoriteJob = () => {
const [favorite, setFavorite] = useState(false);
  return (
          <TouchableOpacity onPress={() => setFavorite(!favorite)}>
            <FontAwesome5 name="star" size={24} color={favorite ? "gold" : "black"} />
          </TouchableOpacity> 
  )
}

export default FavoriteJob