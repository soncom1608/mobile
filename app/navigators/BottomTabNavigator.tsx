import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, getFocusedRouteNameFromRoute } from "@react-navigation/native"
import React, { ReactNode, useEffect, useLayoutEffect, useMemo } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon, IconsApp } from "../components"
import { TxKeyPath, translate } from "../i18n"
import { ExplainScreen } from "../screens"
import {
  HomeScreen,
  SettingScreen,
  QrScreen,
  AttendanceScreen,
  StaffExplainListScreen,
  ExplainDetailScreen,
  ApprovalScreen,
  ChangeInforScreen,
  ChangePasswordScreen,
  NotificationScreen,
  NotificationDetailScreen,
} from "../screens"
import { colors, spacing, typography } from "../theme"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { StackScreenProps } from "@react-navigation/stack"
import { useStores } from "../models"

export type DivisionParamList = {
  HomeScreens: undefined
  ExplainScreens: undefined
  Attendance: { name: string }
  StaffExplainList: undefined
  ExplainDetailScreen: { id: string }
  ExplainList: undefined
  ApprovalScreen: { type: "user" | "leader" }
}

export const StacksHome = createNativeStackNavigator<DivisionParamList>()
export type HomeStackScreenProps<T extends keyof DivisionParamList> = StackScreenProps<
  DivisionParamList,
  T
>
// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Qr: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Qr" component={QrScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
const HomeStack: FC<StackScreenProps<BottomTabParamList, "HomeScreen">> = observer(function Home({
  navigation,
  route,
}) {
  const routeName = getFocusedRouteNameFromRoute(route)
  useLayoutEffect(() => {
    if (
      routeName !== "ExplainScreens" &&
      routeName !== "StaffExplainList" &&
      routeName !== "ExplainList" &&
      routeName !== "ExplainDetailScreen" &&
      routeName !== "ApprovalScreen" &&
      routeName !== "Attendance"
    ) {
      navigation.setOptions({ tabBarStyle: "" })
    } else {
      navigation.setOptions({ tabBarStyle: { display: "none" } })
    }
    return () => {}
  }, [navigation, route])
  return (
    <StacksHome.Navigator screenOptions={{ headerShown: false }}>
      <StacksHome.Screen name="HomeScreens" component={HomeScreen} />
      <StacksHome.Screen name="ExplainScreens" component={ExplainScreen} />
      <StacksHome.Screen name="Attendance" component={AttendanceScreen} />
      <StacksHome.Screen name="StaffExplainList" component={StaffExplainListScreen} />
      <StacksHome.Screen name="ExplainDetailScreen" component={ExplainDetailScreen} />
      <StacksHome.Screen name="ApprovalScreen" component={ApprovalScreen} />
    </StacksHome.Navigator>
  )
})

export type SettingParamList = {
  OptionsScreen: undefined
  ChangeInfor: undefined
  ChangePassword: undefined
}

export const SettingsHome = createNativeStackNavigator<SettingParamList>()
// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Qr: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Qr" component={QrScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore

const SettingStack: FC<StackScreenProps<SettingParamList, "OptionsScreen">> = observer(
  function Setting({ navigation, route }) {
    const routeName = getFocusedRouteNameFromRoute(route)
    useLayoutEffect(() => {
      if (routeName !== "ChangeInfor" && routeName !== "ChangePassword") {
        navigation.setOptions({ tabBarStyle: "" })
      } else {
        navigation.setOptions({ tabBarStyle: { display: "none" } })
      }
      return () => {}
    }, [navigation, route])
    return (
      <SettingsHome.Navigator
        screenOptions={{ headerShown: false }}
        // @demo remove-current-line
      >
        <SettingsHome.Screen name="OptionsScreen" component={SettingScreen} />
        <SettingsHome.Screen name="ChangeInfor" component={ChangeInforScreen} />
        <SettingsHome.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </SettingsHome.Navigator>
    )
  },
)

export type NotificationParamList = {
  NotificationScreen: undefined
  NotificationDetail: { id: string }
}

export const NotificationStack = createNativeStackNavigator<NotificationParamList>()
// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Qr: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="NotificationScreen" component={NotificationScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore

const NotificationsStack: FC<StackScreenProps<NotificationParamList, "NotificationScreen">> =
  observer(function Setting({ navigation, route }) {
    const routeName = getFocusedRouteNameFromRoute(route)
    useLayoutEffect(() => {
      if (routeName !== "NotificationDetail") {
        navigation.setOptions({ tabBarStyle: "" })
      } else {
        navigation.setOptions({ tabBarStyle: { display: "none" } })
      }
      return () => {}
    }, [navigation, route])
    return (
      <NotificationStack.Navigator
        screenOptions={{ headerShown: false }}
        // @demo remove-current-line
      >
        <NotificationStack.Screen name="NotificationScreen" component={NotificationScreen} />
        <NotificationStack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
      </NotificationStack.Navigator>
    )
  })

export type BottomTabParamList = {
  HomeScreen: undefined
  SettingScreen: undefined
  QrScreen: undefined
  Notification: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type DemoTabScreenProps<T extends keyof BottomTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

type propsMenu = {
  component: ReactNode | any
  icons: (focused: boolean) => ReactNode | any
  name: keyof BottomTabParamList
  translate: TxKeyPath
  isUser?: true
}
const Tab = createBottomTabNavigator<BottomTabParamList>()
const menus: propsMenu[] = [
  {
    icons: (focused: boolean) => {
      return (
        <IconsApp
          icon={<Ionicons name="ios-home" size={20} color={focused && colors.mainColor} />}
        />
      )
    },
    name: "HomeScreen",
    translate: "navigator.HomeTab",
    component: HomeStack,
  },
  {
    icons: (focused) => {
      return (
        <IconsApp
          icon={
            <MaterialCommunityIcons
              name="calendar-multiple-check"
              size={20}
              color={focused && colors.mainColor}
            />
          }
        />
      )
    },
    name: "QrScreen",
    translate: "navigator.QRTab",
    component: QrScreen,
  },
  {
    icons: (focused) => {
      return (
        <IconsApp
          icon={<Ionicons name="md-notifications" size={24} color={focused && colors.mainColor} />}
        />
      )
    },
    name: "Notification",
    translate: "navigator.Notification",
    component: NotificationsStack,
    isUser: true,
  },

  {
    icons: (focused) => {
      return (
        <IconsApp
          icon={
            <Ionicons name="md-settings-outline" size={20} color={focused && colors.mainColor} />
          }
        />
      )
    },
    name: "SettingScreen",
    translate: "navigator.Setting",
    component: SettingStack,
  },
]

export function BottomTabNavigator() {
  // const { bottom } = useSafeAreaInsets()
  const {
    userStore: { role },
  } = useStores()
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [$tabBar, { backgroundColor: "white" }],
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: $tabBarLabel,
        tabBarItemStyle: $tabBarItem,
      }}
    >
      {menus?.map((item, id) => {
        if (item?.isUser) {
          const check = role === "user"
          if (!check) {
            return null
          }
          return (
            <Tab.Screen
              key={id}
              name={`${item?.name}`}
              component={item?.component}
              options={{
                tabBarLabel: translate(`${item?.translate}`),
                tabBarIcon: ({ focused }) => item?.icons(focused),
              }}
            />
          )
        }
        return (
          <Tab.Screen
            key={id}
            name={`${item?.name}`}
            component={item?.component}
            options={{
              tabBarLabel: translate(`${item?.translate}`),
              tabBarIcon: ({ focused }) => item?.icons(focused),
            }}
          />
        )
      })}
    </Tab.Navigator>
  )
}

const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
}

const $tabBarItem: ViewStyle = {
  // paddingTop: spacing.medium,
}

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  flex: 1,
}

// @demo remove-file
