import React, { FC, ReactNode, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ScrollView, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../navigators"
import { ChangeLanguage, ItemList, SkeletonItemlist, SkeletonProfileNav, Text } from "../components"
import i18 from "i18n-js"
import { useStores } from "../models"
import { loadString } from "../utils/storage"
import { Avatar, Box, Button, Center, HStack, Modal } from "native-base"
import { colors } from "../theme"
import { AntDesign } from "@expo/vector-icons"
import packageJson from "../../package.json"
import { TxKeyPath } from "../i18n"
const version = packageJson.version
type props = {
  icons: ReactNode | any
  translate: TxKeyPath
  active: () => void
  arrowRight: boolean
  image?: boolean
  text?: string
}

const roles = {
  user: "Nhân viên",
  leader: "Quản lí địa điểm",
  manager: "Quản lý khu vực",
  admin: "Giám đốc",
}
// import { useStores } from "../models"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Setting: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Setting" component={SettingScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const SettingScreen: FC<StackScreenProps<AppStackScreenProps, "Setting">> = observer(
  function SettingScreen({ navigation }) {
    // Pull in one of our MST stores

    const [skeleton, setSkeleton] = useState(false)
    const [changeLanguage, setChangeLanguage] = useState<boolean>(false)
    const [language, setLanguage] = useState<string>("")

    const {
      authenticationStore: { logout },
      userStore: {
        getCurrentUser,
        deleteInforUser,
        avatar,
        email,
        id,
        name,
        role,
        org_ids,
        username,
      },
    } = useStores()
    // console.log("setting", user)
    const AcitveList: props[] = [
      {
        active: () => {
          setChangeLanguage(true)
        },
        icons: <AntDesign name="earth" size={24} colors="black" />,
        translate: "settingScreen.language",
        arrowRight: true,
        image: true,
      },
      {
        active: () => {
          navigation.navigate("ChangePassword", {})
        },
        icons: <AntDesign name="edit" size={24} colors="black" />,
        translate: "settingScreen.changePassword",
        arrowRight: true,
        image: true,
      },
      {
        active: () => {},
        icons: <AntDesign name="infocirlceo" size={24} colors="black" />,
        translate: "settingScreen.verInfo",
        arrowRight: false,
        image: true,
        text: "0.0.2",
      },
      {
        active: () => {
          IsLogout()
        },
        icons: <AntDesign name="logout" size={24} colors="black" />,
        translate: "settingScreen.logout",
        arrowRight: true,
        image: true,
      },
    ]
    // Đăng xuất
    const IsLogout = useCallback(() => {
      deleteInforUser()
      logout()
    }, [])

    // Đóng modal thay đổi ngôn ngữ
    const onClose = useCallback((data: boolean) => {
      setChangeLanguage(data)
      // setChangePassword(data)
    }, [])

    // lấy thông tin ngôn ngữ được lưu ở localStorage
    const getLanguage = useCallback(async () => {
      const lg = await loadString("language")
      if (lg) {
        setLanguage(lg)
      } else {
        const locale = i18.locale.split("-")[0]
        setLanguage(locale)
      }
    }, [setLanguage])

    useEffect(() => {
      if (!id) {
        getCurrentUser()
        setSkeleton(true)
      } else {
        setSkeleton(false)
      }
      getLanguage()
      return () => {
        getLanguage()
        setSkeleton(null)
      }
    }, [])
    // if (skeleton) {
    //   return <SkeletonProfileNav />
    // }

    return (
      <View style={$root}>
        <ScrollView>
          <Box
            marginY="10"
            paddingY={10}
            style={{
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              backgroundColor: "#dcedf3",
            }}
          >
            <Box paddingBottom="5">
              <Center>
                {/* <PickImage uri={data["avatar"]} update={updateAvatar} /> */}
                <Avatar
                  source={{
                    uri: avatar?.name
                      ? `http://192.168.1.144:3000/v1/users/getImage?avatarName=${avatar?.name}`
                      : "https://picsum.photos/200/300",
                  }}
                  size="xl"
                  maxW={120}
                  maxH={120}
                  style={{ borderWidth: 0.5 }}
                >
                  <Avatar.Badge bg="green.500" />
                </Avatar>
                {/* <HStack alignItems={"center"}>
                  <Text text={name} />
                </HStack>
                <HStack>
                  <Text tx="settingScreen.role" />
                  <Text text={`: ${roles[`${role}`]}`} />
                </HStack> */}
              </Center>
            </Box>
          </Box>
          <Box>
            <ItemList
              tx="settingScreen.employ"
              fontWeight={"bold"}
              onPressIn={() => {
                // showViewProfile(true)
                navigation.navigate("ChangeInfor")
              }}
              arrowRight={true}
              image={true}
              icon={<AntDesign name="user" size={24} colors="black" />}
            />
          </Box>
          <Box>
            {AcitveList?.map((item, id) => {
              return (
                <ItemList
                  key={id}
                  tx={item?.translate}
                  fontWeight={"bold"}
                  arrowRight={item?.arrowRight}
                  image={item?.image}
                  icon={item?.icons}
                  onPressIn={item?.active}
                  text={item?.text}
                />
              )
            })}
          </Box>
          {changeLanguage ? (
            <ChangeLanguage
              isChange={true}
              languageStorage={language}
              passing={() => {
                onClose(false)
              }}
            />
          ) : null}
        </ScrollView>
      </View>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
  // paddingTop: 20,
  backgroundColor: "white",
}
