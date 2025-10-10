// global.d.ts - NativeWind type declarations
/// <reference types="nativewind/types" />

// Extend React Native components with className prop
declare module 'react-native' {
  interface ViewProps {
    className?: string
  }

  interface TextProps {
    className?: string
  }

  interface PressableProps {
    className?: string
  }

  interface ImageProps {
    className?: string
  }

  interface ScrollViewProps {
    className?: string
  }

  interface SafeAreaViewProps {
    className?: string
  }
}

// Image assets type declarations
declare module '*.png' {
  const value: number
  export default value
}

declare module '*.jpg' {
  const value: number
  export default value
}

declare module '*.jpeg' {
  const value: number
  export default value
}

// Make sure this file is treated as a module
export {}
