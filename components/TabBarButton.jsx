import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { icons } from '../assets/icons';

const TabBarButton = (props) => {
    const {isFocused, label, routeName, color} = props;

    const scale = useSharedValue(0);

    useEffect(() =>{
        scale.value = withSpring( typeof isFocused === 'boolean' ? (isFocused ? 1 : 0): isFocused,
        {duration: 350}
    );
    },[scale, isFocused]);

    const animatedIconStyle = useAnimatedStyle(()=>{

        const scaleValue = interpolate(
            scale.value,
            [0,1],
            [0.8, 1.2]
        );
        
        return{
            transform: [{scale: scaleValue}]
        }
    })
    return (
    <Pressable {...props} style={styles.container}>
        <Animated.View style={[animatedIconStyle]}>
        {
        icons[routeName]({
            color
        })
        }
        </Animated.View>
        
        <Text style={{
            color,
            fontSize: 10 }}>
            {label}
        </Text>
    </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    }
})

export default TabBarButton