import React, { FC, useCallback, useEffect, useMemo, useState, memo } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../navigators"
import { Button, ModalLoader, Screen, Text, ToastMessage } from "../components"
import { useStores } from "../models"
import { Calendar, CalendarProvider, DateData } from "react-native-calendars"
import { formatHHMM, dateDMYStr, dateYMD, dateYMDStr } from "../utils/common"
import { HStack, ScrollView, Spinner, useToast } from "native-base"
import { spacing } from "../theme"
import { AntDesign, Entypo } from "@expo/vector-icons"
import moment from "moment"
import { useNetInfo } from "@react-native-community/netinfo"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../models"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Attendance: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Attendance" component={AttendanceScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const AttendanceScreen: FC<StackScreenProps<AppStackScreenProps, "Attendance">> = observer(
  function AttendanceScreen({ navigation, route }) {
    // Pull in one of our MST stores
    const {
      timesheetStore: {
        getAllTimeSheet,
        getAnTimeSheetByDateTime,
        timesheetNumber,
        oneDayData,
        setDataDay,
      },
      authenticationStore: { idUser },
    } = useStores()

    const [dataCalendar, setDataCalendar] = useState<any>(undefined)
    const [daySelected, setDaySelected] = useState<string>(dateYMD(new Date().getTime()))
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const timeStart = useMemo(() => moment().startOf("month").format("x"), [])
    const timeEnd = useMemo(() => moment().endOf("month").format("x"), [])
    const toast = useToast()
    const netInfo = useNetInfo()

    const getData = useCallback(
      async (timeStart, timeEnd) => {
        setIsLoading(true)
        const data = await getAllTimeSheet(idUser, timeStart, timeEnd)
        setDataCalendar(data)
        setIsLoading(false)
      },
      [setIsLoading, setDataCalendar],
    )
    useEffect(() => {
      if (netInfo.isConnected == null || netInfo.isConnected == true) {
        getData(timeStart, timeEnd)
      } else {
        toast.show({
          placement: "top",
          render: () => {
            return <ToastMessage text="Vui lòng kiểm tra lại kết nối ! " type="warning" />
          },
        })
      }
      return () => {
        getData
      }
    }, [netInfo.isConnected])

    const onDayPress = useCallback(
      async (date) => {
        setDaySelected(dateYMD(date["timestamp"]))
        const daySelect = dataCalendar?.[`${dateYMDStr(date["timestamp"])}`]?.["dateMarked"]
        if (daySelect) {
          await getAnTimeSheetByDateTime(
            Number(moment(daySelect).startOf("day").format("x")),
            Number(moment(daySelect).endOf("day").format("x")),
          )
          return
        } else {
          setDataDay()
        }
      },
      [daySelected, setDataDay, getAnTimeSheetByDateTime, setDaySelected],
    )

    const onMonthChange = useCallback(
      async (date: DateData) => {
        const data = await getAllTimeSheet(
          idUser,
          Number(moment(date?.timestamp).startOf("month").format("x")),
          Number(moment(date?.timestamp).endOf("month").format("x")),
        )
        setDataCalendar(data)
      },
      [setDataCalendar, getAllTimeSheet],
    )

    if (isLoading) {
      return (
        <HStack flex={1} display={"flex"} justifyContent="center" alignItems="center">
          <Spinner size="lg" />
        </HStack>
      )
    }
    return (
      <Screen
        style={$root}
        contentContainerStyle={$container}
        preset="fixed"
        safeAreaEdges={["end"]}
      >
        <View style={$header}>
          <HStack justifyContent={"space-between"} alignItems={"center"}>
            <AntDesign
              name="back"
              size={24}
              color="black"
              onPress={() => {
                navigation.goBack()
              }}
            />
            <Text tx="AttendanceScreen.headerAttendance" />
            <Entypo name="menu" size={24} color="black" />
          </HStack>
        </View>
        <ScrollView>
          <View>
            <View>
              <Text
                text={`${route["params"]["name"]}`}
                style={{ textAlign: "center", paddingVertical: 5 }}
              />
              <Text style={{ paddingVertical: 5 }}>Số công của tháng :{timesheetNumber}</Text>
              <CalendarProvider
                date={`${daySelected}`}
                style={{ borderWidth: 2, borderColor: "blue", borderRadius: 5 }}
              >
                <Calendar
                  onMonthChange={onMonthChange}
                  onDayPress={onDayPress}
                  markedDates={{
                    [daySelected]: {
                      selected: true,
                      disableTouchEvent: true,
                      selectedColor: "#3288f2",
                    },
                    ...dataCalendar,
                  }}
                />
              </CalendarProvider>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>{`${dateDMYStr(daySelected)}`}</Text>
          <View style={{ marginBottom: 20 }}>
            {oneDayData &&
              [...oneDayData]?.map(function (el, index) {
                return (
                  <View key={index} style={{ paddingVertical: 5 }}>
                    <HStack>
                      <Text
                        style={{ fontSize: 12, fontWeight: "700" }}
                        tx="AttendanceScreen.namePlace"
                      />
                      <Text style={{ fontSize: 12 }}>{`${el.name}`}</Text>
                    </HStack>
                    <HStack>
                      <Text
                        tx="AttendanceScreen.time"
                        style={{ fontSize: 12, fontWeight: "700" }}
                      />
                      <Text style={{ fontSize: 12 }}>{`${formatHHMM(el.datetime)}`}</Text>
                    </HStack>
                  </View>
                )
              })}
          </View>
        </ScrollView>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}
const $boxinfor: ViewStyle = {
  marginTop: 5,
}
const $container: ViewStyle = {
  paddingTop: spacing.extraLarge,
  paddingHorizontal: spacing.medium,
  backgroundColor: "#ffffff",
  flex: 1,
}
const $header: ViewStyle = {
  paddingVertical: 10,
}
