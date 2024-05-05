import React, { FC, memo, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { SafeAreaView, View, ViewStyle, Text, TouchableOpacity, RefreshControl } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../navigators"
import { Screen } from "../components"
import { useStores } from "../models"
import { FlatList } from "react-native-gesture-handler"
import { Avatar, HStack, Spinner } from "native-base"
import moment from "moment"
import { color, colors } from "../theme"

const PAGE_LIMIT = 20
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

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Notification: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Notification" component={NotificationScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore

export const NotificationScreen: FC<StackScreenProps<AppStackScreenProps, "Notification">> =
  observer(function NotificationScreen({ navigation }) {
    // Pull in one of our MST stores
    const {
      userStore: { id },
      notificationStore: { getNotifications },
    } = useStores()

    const [list, setList] = useState([])
    const [load, setLoad] = useState(false)
    const [page, setPage] = useState<number>(1)
    const fetchData = useCallback(
      async (page: number) => {
        try {
          const data = await getNotifications(id, page, PAGE_LIMIT)
          setList(data)
        } catch (e) {
          throw new Error("fetch data Notification failt")
        }
      },
      [setList, getNotifications],
    )
    const OnRefresh = useCallback(async () => {
      setLoad(true)
      setPage(1)
      try {
        const data = await getNotifications(id, 1, PAGE_LIMIT)
        console.log(data)
        setList(data)
        setLoad(false)
      } catch (e) {
        setLoad(false)
        throw new Error("Rllo")
      }
    }, [setLoad, setPage])
    const onLoadMore = useCallback(() => {
      if (load && page < page + 1) {
        console.log("load")
      }
    }, [])

    const renderItem = useCallback(({ item }: { item: notificationType | any }) => {
      return (
        <TouchableOpacity
          style={{
            padding: 15,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 80,
          }}
          onPress={() => {
            handSeenNotification(item?.id)
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Avatar
              source={{
                uri:
                  "https://picsum.photos/200/300" ??
                  `http://172.20.10.7:3000/v1/users/getImage?avatarName=${item?.user_id?.avatar?.name}`,
              }} // https://picsum.photos/200/300 `http://192.168.1.145:3000/v1/users/getImage?avatarName=${item?.user_id?.avatar?.name}`
              size="md"
              maxW={40}
              maxH={40}
            >
              Avatar
            </Avatar>
            <View
              style={{
                marginLeft: 5,
                display: "flex",
                alignItems: "stretch",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontWeight: "700", color: !item?.status ? colors?.seen : colors?.unSeen }}
              >
                Người tạo: {item?.create_name}
              </Text>
              <Text
                style={{ fontWeight: "700", color: !item?.status ? colors?.seen : colors?.unSeen }}
              >
                {/* Ngày tạo :{item?.create_date} */}
                Ngày tạo :{moment(item?.create_date).format("DD-MM-yyyy")}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: !item?.status ? "#1BB045" : "#919699",
              borderRadius: 5,
            }}
          />
        </TouchableOpacity>
      )
    }, [])

    const handSeenNotification = useCallback(
      (id: string) => {
        const formatList = list?.map((item) => {
          if (item?.id === id) {
            return { ...item, status: true }
          }
          return item
        })
        setList(formatList)

        navigation.navigate("NotificationDetail", { id: id })
      },
      [navigation, setList],
    )

    useEffect(() => {
      const followScreen = navigation.addListener("focus", () => {
        fetchData(1)
      })
      return () => {
        fetchData
      }
    }, [fetchData])

    if (load) {
      return (
        <HStack flex={1} display={"flex"} justifyContent="center" alignItems="center">
          <Spinner size="lg" />
        </HStack>
      )
    }
    return (
      <Screen style={$root} preset="fixed">
        <Text style={{ textAlign: "center", fontWeight: "800", marginTop: 5, fontSize: 20 }}>
          Thông báo
        </Text>
        <SafeAreaView>
          <View>
            <FlatList
              data={list ?? []}
              renderItem={renderItem}
              onEndReachedThreshold={0.7}
              refreshing={true}
              onEndReached={onLoadMore}
              keyExtractor={(item) => item?.id}
              refreshControl={<RefreshControl refreshing={load} onRefresh={OnRefresh} />}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </View>
        </SafeAreaView>
      </Screen>
    )
  })

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: "white",
  paddingTop: 30,
}
