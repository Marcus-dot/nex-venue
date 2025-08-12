import { View, ActivityIndicator } from 'react-native'

const AppLoader = () => {
  return (
    <View className='flex-1 flex flex-col items-center bg-background justify-center'>
      <ActivityIndicator size={"large"} />
    </View>
  )
}

export default AppLoader;