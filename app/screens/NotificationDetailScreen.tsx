import React, { FC, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { SafeAreaView, View, ViewStyle, Dimensions } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../navigators"
import { Screen, Text } from "../components"
import { NotificationParamList } from "../navigators/BottomTabNavigator"
import { useStores } from "../models"
import { HStack, Spinner } from "native-base"
import moment from "moment"

type notificationType = {
  content: string
  create_date: number
  create_name: string
  id: string
  user_id: string
  status?: boolean
}
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../models"

const width = Dimensions.get("screen").width * 0.9
// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `NotificationDetail: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const NotificationDetailScreen: FC<
  StackScreenProps<NotificationParamList, "NotificationDetail">
> = observer(function NotificationDetailScreen({ route }) {
  const {
    notificationStore: { getNotification, updateNotification },
  } = useStores()
  const id = route?.params?.id
  const [load, setLoad] = useState(false)
  const [notificationDetail, setDetail] = useState<notificationType>()

  useEffect(() => {
    setLoad(false)
    const getData = async () => {
      await updateNotification(id)
      const result = await getNotification(id)
      setDetail(result)
    }
    getData()
    setLoad(true)
  }, [setDetail])
  if (!load) {
    return (
      <HStack flex={1} display={"flex"} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </HStack>
    )
  }
  return (
    <Screen style={$root} preset="fixed">
      <SafeAreaView>
        <View>
          <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "800", marginTop: 40 }}>
            Chi tiết thông báo
          </Text>
          <View>
            {notificationDetail && (
              <View style={{ width: width }}>
                <HStack>
                  <Text style={{ fontWeight: "700" }}>Người tạo : </Text>
                  <Text>{notificationDetail?.create_name}</Text>
                </HStack>
                <HStack>
                  <Text style={{ fontWeight: "700" }}>Ngày tạo : </Text>
                  <Text>{moment(notificationDetail?.create_date).format("DD-MM-YYYY")}</Text>
                </HStack>
                <HStack>
                  <Text style={{ fontWeight: "700" }}>Nội dung : </Text>
                  <Text>{notificationDetail?.content}</Text>
                </HStack>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding: 20,
  backgroundColor: "white",
}
