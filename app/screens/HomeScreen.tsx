import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../navigators"
import { AutoImage, Icon, Screen, Text, Maps, ToastMessage } from "../components"
import { spacing } from "../theme"
import { Ionicons, Feather } from "@expo/vector-icons"
import { useStores } from "../models"
import { Center, HStack, Modal, Button as BTN, useToast, Avatar } from "native-base"
import { useNetInfo } from "@react-native-community/netinfo"
import { localHost } from "../utils/const"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../models"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Home: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Home" component={HomeScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const HomeScreen: FC<StackScreenProps<AppStackScreenProps, "Home">> = observer(
  function HomeScreen({ navigation, route }) {
    const {
      placeStore: { getAllPlace, listPlaces },
      userStore: { getUserByOrg, avatar, name, role, id },
      timesheetStore: { setIdUserTimeSheet },
    } = useStores()
    console.log(`http://192.168.1.145:3000/v1/users/getImage?avatarName=${avatar?.name}`)
    const [listUser, setListUser] = useState([])
    // const [open, setOpen] = useState(false)
    const [openList, setOpenList] = useState(false)
    const toast = useToast()
    const netInfo = useNetInfo()
    const navigateCalendar = useCallback(
      (value) => {
        setIdUserTimeSheet(value["id"])
        navigation.navigate("Attendance", { name: value["name"] })
      },
      [setIdUserTimeSheet, navigation],
    )
    // const handleClickMap = (data) => {
    //   setInforPlace(data)
    //   setOpen(true)
    // }
    const getListPlace = useCallback(async () => {
      if (netInfo.isConnected == null || netInfo.isConnected == true) {
        let list = await getAllPlace()
        if (role == "leader") {
          // chi co leader moi co quyen xem vien vien cua to chuc
          let listUser = await getUserByOrg()
          setListUser(listUser)
        }
      } else {
        toast.show({
          placement: "top",
          duration: 1000,
          render: () => {
            return <ToastMessage text="Vui lòng kiểm tra lại kết nối ! " type="warning" />
          },
        })
      }
    }, [getAllPlace, toast])
    useEffect(() => {
      getListPlace()
      return () => {
        getAllPlace
      }
    }, [getListPlace])
    const InforPatrol = useCallback(() => {
      if (role == "user") {
        setIdUserTimeSheet(id)
        navigation.navigate("Attendance", { name: name })
      } else {
        setOpenList(true)
      }
    }, [setIdUserTimeSheet, navigation])

    // useEffect(() => {
    //   getUserInfo()
    // }, [])

    return (
      <Screen preset="scroll" contentContainerStyle={$container} safeAreaEdges={["end"]}>
        <View style={$header}>
          <Icon icon="menu" size={30} />
          <Text tx="HomeScreen.NameApp" />
          <Avatar
            source={{
              uri: avatar?.name
                ? `http://172.20.10.7:3000/v1/users/getImage?avatarName=${avatar?.name}`
                : "https://picsum.photos/200/300",
            }}
            // borderRadius={40}
            size={"lg"}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          >
            <Avatar.Badge bg="green.500" />
          </Avatar>
        </View>
        <Center>
          <HStack>
            <Text tx="HomeScreen.labelHello" style={{ fontWeight: "700" }} />
            <Text>{`, ${name}`}</Text>
          </HStack>
        </Center>
        <View style={page}>
          <View style={containerMap}>
            <Maps style={map} MarkerListUser={listPlaces} />
          </View>
        </View>
        <View style={{ marginTop: 5 }}>
          <HStack style={{ justifyContent: "space-around" }}>
            <BTN
              style={{ width: "40%" }}
              onPress={InforPatrol}
              leftIcon={<Ionicons name="information-circle" size={24} color="white" />}
            >
              <Text
                tx="HomeScreen.InforPatrol"
                style={{ textAlign: "center", fontWeight: "700", color: "white", fontSize: 14 }}
              />
            </BTN>
            {role === "leader" ? (
              <BTN
                style={{ width: "40%" }}
                leftIcon={<Feather name="file-text" size={24} color="white" />}
                onPress={() => {
                  navigation.navigate("ApprovalScreen", { type: "leader" })
                }}
              >
                <Text
                  tx="HomeScreen.explaination"
                  style={{ textAlign: "center", fontWeight: "700", color: "white", fontSize: 14 }}
                />
              </BTN>
            ) : (
              <BTN
                style={{ width: "40%" }}
                leftIcon={<Feather name="file-text" size={24} color="white" />}
                onPress={() => {
                  navigation.navigate("ExplainScreens", { type: "user" })
                }}
              >
                <Text
                  tx="HomeScreen.explaination"
                  style={{ textAlign: "center", fontWeight: "700", color: "white", fontSize: 14 }}
                />
              </BTN>
            )}
          </HStack>
        </View>
        {/* <View style={page}>
          <View style={containerMap}>
            <Maps style={map} MarkerListUser={listPlaces} />
          </View>
        </View> */}
        <Modal
          isOpen={openList}
          safeAreaTop={true}
          onClose={() => {
            setOpenList(false)
          }}
        >
          <Modal.Content maxWidth="100%">
            <Modal.CloseButton />
            <Modal.Header>
              <Text tx="HomeScreen.listStaffOrg" />
            </Modal.Header>
            {listUser &&
              listUser.map((value, index) => {
                // danh sach nhan vien trong to chuc getALLStaff
                return (
                  <HStack
                    key={index}
                    display={"flex"}
                    justifyContent={"space-between"}
                    flexDirection={"row"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    <BTN
                      size="sm"
                      variant="ghost"
                      w={"100%"}
                      style={{ display: "flex", justifyContent: "flex-start" }}
                      onPress={() => {
                        navigateCalendar(value)
                      }}
                    >
                      <Text style={{ fontSize: 13 }} text={`${value["name"]}`} />
                    </BTN>
                  </HStack>
                )
              })}
          </Modal.Content>
        </Modal>
      </Screen>
    )
  },
)

const $container: ViewStyle = {
  paddingTop: spacing.large + spacing.extraLarge,
  paddingHorizontal: spacing.medium,
  backgroundColor: "#FFFFFF",
  flex: 1,
}
const $header: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: 2,
}
const page: TextStyle = {
  // flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 20,
}
const containerMap: TextStyle = {
  height: 300,
  width: 300,
  backgroundColor: "tomato",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "#06b6d4",
  borderRadius: 10,
}
const map: ViewStyle = {
  flex: 1,
  width: "100%",
  height: 300,
}
