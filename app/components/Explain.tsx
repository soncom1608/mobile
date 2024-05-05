import * as React from "react"
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "./Text"
import { HStack, Popover, Select, TextArea, useToast } from "native-base"
import { Button } from "native-base"
import { AntDesign, Entypo, Feather, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons"
import { StackNavigationProp } from "@react-navigation/stack"
import { DivisionParamList } from "../navigators/BottomTabNavigator"
import { useStores } from "../models"
import { useNetInfo } from "@react-native-community/netinfo"
import { ToastMessage } from "./ToastMessage"
import moment from "moment"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as zod from "zod"
import { Calendar, CalendarProvider, DateData } from "react-native-calendars"
import { dateYMD } from "../utils/common"
type textProps = {
  fieldName: string
  isRequired?: boolean
}
const RequiredText = ({ props }: { props: textProps }) => {
  return (
    <HStack mb={2}>
      {props?.isRequired && <Text style={{ color: "red" }}>* </Text>}
      <Text style={{ fontWeight: "700" }}>{props?.fieldName}</Text>
    </HStack>
  )
}
export interface DivisionProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  navigation?: StackNavigationProp<DivisionParamList>
}

export const Explain = observer(function Division(props: DivisionProps) {
  const { style, navigation } = props
  const {
    placeStore: { listPlaces },
    explainStore: { addExplain },
    authenticationStore: { idUser, name_user },
  } = useStores()
  const netInfo = useNetInfo()
  const toast = useToast()
  const [openMenu, setOpenMenu] = React.useState(false)
  const [daySelected, setDaySelected] = React.useState<string>(dateYMD(new Date().getTime()))
  const validationSchema = React.useMemo(
    () =>
      zod.object({
        reason: zod.string({ required_error: "Lí do là trường bắt buộc" }).trim().nonempty({
          message: "Lí do không được để trống",
        }),
        status: zod.string({ required_error: "Trạng thái là trường bắt buộc" }).trim().nonempty({
          message: "Trạng thái mới không được để trống",
        }),
        place: zod.string({ required_error: "Địa điểm là trường bắt buộc" }).trim().nonempty({
          message: "Địa điểm không được để trống",
        }),
        dateExplain: zod.number({ required_error: "Chọn ngày giải trình" }),
        decription: zod.string().optional(),
      }),
    [],
  )
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      reason: undefined,
      status: undefined,
      place: undefined,
      decription: undefined,
      dateExplain: moment().format("x"),
    },
    resolver: zodResolver(validationSchema),
  })
  React.useEffect(() => {
    const getData = async () => {
      if (netInfo.isConnected == null || netInfo.isConnected == true) {
        // const response = await getAllStaff()
        // setMember(response)
      } else {
        toast.show({
          placement: "top",
          render: () => {
            return <ToastMessage text="Vui lòng kiểm tra lại kết nối ! " type="warning" />
          },
        })
      }
    }
    getData()
    return () => {
      getData()
    }
  }, [netInfo.isConnected])
  const onDayPress = React.useCallback(
    (date) => {
      console.log(date)
      setValue("dateExplain", date?.timestamp)
      setDaySelected(date?.dateString)
    },
    [setValue, setDaySelected],
  )
  const addExplainUser = React.useCallback(async () => {
    const selectedPlace = listPlaces.find((item) => {
      return item?.id === getValues("place")
    })
    try {
      const response = await addExplain(
        getValues("reason"),
        idUser,
        name_user,
        getValues("decription") ?? "",
        selectedPlace?.id,
        selectedPlace?.name,
        getValues("dateExplain") as unknown as number,
        getValues("status"),
        selectedPlace?.lat,
        selectedPlace?.long,
      )
      if (response) {
        reset({ decription: "", place: "", reason: "", status: "" })
        toast.show({
          placement: "top",
          render: () => {
            return <ToastMessage text="Tạo đơn giải trình thành công" type="success" />
          },
          duration: 3000,
        })
      } else {
        toast.show({
          placement: "top",
          render: () => {
            return (
              <ToastMessage text="Tạo đơn giải trình thất bại vì giải trình thiếu" type="error" />
            )
          },
          duration: 3000,
        })
      }
    } catch (e) {
      toast.show({
        placement: "top",
        render: () => {
          return (
            <ToastMessage text="Tạo đơn giải trình thất bại vì giải trình thiếu" type="error" />
          )
        },
        duration: 3000,
      })
    }
  }, [
    idUser,
    name_user,
    getValues("reason"),
    getValues("decription"),
    getValues("dateExplain"),
    getValues("status"),
    reset,
    addExplain,
    toast,
  ])

  return (
    <View style={$container}>
      <View style={$header}>
        <HStack justifyContent={"space-between"} alignItems={"center"}>
          <AntDesign
            name="back"
            size={24}
            color="black"
            onPress={() => {
              navigation.navigate("HomeScreens")
            }}
          />
          <Text tx="DivisionScreen.headerDivision" style={{ fontWeight: "700" }} />

          <Popover // @ts-ignore
            placement={"bottom right"}
            trigger={(triggerProps) => {
              return (
                <TouchableOpacity
                  {...triggerProps}
                  hitSlop={{ bottom: 10, right: 10, left: 10, top: 10 }}
                  onPress={() => setOpenMenu(true)}
                >
                  <Entypo name="menu" size={30} color="black" />
                </TouchableOpacity>
              )
            }}
            isOpen={openMenu}
            onClose={() => setOpenMenu(!openMenu)}
          >
            <Popover.Content w="56">
              <Popover.Arrow />
              {/* <Popover.CloseButton onPress={() => setOpenMenu(false)} /> */}
              <Popover.Header>Tùy chọn</Popover.Header>
              <Popover.Body>
                <TouchableOpacity
                  style={{
                    borderBottomColor: "#c3c3c3",
                    borderBottomWidth: 1,
                    marginBottom: 4,
                    paddingBottom: 15,
                  }}
                  onPress={() => {
                    navigation.navigate("ApprovalScreen", { type: "user" })
                  }}
                >
                  <HStack>
                    <Feather name="menu" size={24} color="black" style={{ marginRight: 10 }} />
                    <Text style={{ fontWeight: "800" }}>Danh sách đơn</Text>
                  </HStack>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    borderBottomColor: "#c3c3c3",
                    borderBottomWidth: 1,
                    marginBottom: 4,
                    paddingBottom: 15,
                  }}
                >
                  <HStack>
                    <SimpleLineIcons
                      style={{ marginRight: 10 }}
                      name="options"
                      size={24}
                      color="black"
                    />
                    <Text style={{ fontWeight: "800" }}>Tùy chọn khác</Text>
                  </HStack>
                </TouchableOpacity>
              </Popover.Body>
            </Popover.Content>
          </Popover>
        </HStack>
      </View>
      <RequiredText props={{ fieldName: "Chọn trạng thái cần giải trình :", isRequired: true }} />
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { value, onChange } }) => {
          return (
            <Select
              selectedValue={value}
              minWidth="200"
              accessibilityLabel="Chọn trạng thái"
              placeholder="Chọn trạng thái"
              mt={1}
              onValueChange={onChange}
            >
              <Select.Item label="Chấm vào" value="in" />
              <Select.Item label="Chấm ra" value="out" />
            </Select>
          )
        }}
        name="status"
      />
      <Text style={{ color: "red", fontSize: 14 }}>{errors.status?.message as string}</Text>
      <RequiredText props={{ fieldName: "Chọn lí do :", isRequired: true }} />
      <Controller
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <Select
              selectedValue={value}
              minWidth="200"
              accessibilityLabel="Chọn lí do"
              placeholder="Chọn lí do"
              mt={1}
              onValueChange={onChange}
            >
              <Select.Item label="Lỗi vị trí" value="Lỗi vị trí" />
              <Select.Item label="Quên chấm công" value="Quên chấm công" />
              <Select.Item label="Không lấy được địa chỉ MAC" value="Không lấy được địa chỉ MAC" />
              <Select.Item label="Lỗi mạng" value="Lỗi mạng" />
              <Select.Item label="Không lấy được địa chỉ IP" value="Không lấy được địa chỉ IP" />
              <Select.Item label="Khác" value="Khác" />
            </Select>
          )
        }}
        name="reason"
      />
      <Text style={{ color: "red", fontSize: 14 }}>{errors.reason?.message as string}</Text>
      <RequiredText props={{ fieldName: "Chọn địa điểm :", isRequired: true }} />
      <Controller
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <Select
              selectedValue={value}
              minWidth="200"
              accessibilityLabel="Chọn lí do"
              placeholder="Chọn lí do"
              mt={1}
              onValueChange={onChange}
            >
              {listPlaces?.map((item, id) => {
                return <Select.Item key={id} label={item?.name} value={item?.id} />
              })}
            </Select>
          )
        }}
        name="place"
      />
      <Text style={{ color: "red", fontSize: 14 }}>{errors.place?.message as string}</Text>

      <RequiredText props={{ fieldName: "Chọn ngày giải trình :", isRequired: true }} />
      <Controller
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <CalendarProvider
              date={`${value}`}
              style={{ borderWidth: 2, borderColor: "blue", borderRadius: 5 }}
            >
              <Calendar
                onDayPress={onDayPress}
                markedDates={{
                  [daySelected]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: "#3288f2",
                  },
                }}
                maxDate={moment().format("YYYY-MM-DD")}
                // renderHeader={(date) => {
                //   console.log(date)
                //   return <Text> Tháng {moment(date).format("MM-YYYY")}</Text>
                // }}
                // enableSwipeMonths={true}
              />
            </CalendarProvider>
          )
        }}
        name="place"
      />
      <Text style={{ color: "red", fontSize: 14 }}>{errors.dateExplain?.message as string}</Text>

      <RequiredText props={{ fieldName: "Mô tả :", isRequired: false }} />
      <Controller
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <TextArea
              value={value}
              h={20}
              placeholder="Chi tiết lí do làm đơn"
              mt={2}
              autoCompleteType={true}
              onChangeText={onChange}
            />
          )
        }}
        name="decription"
      />

      <Button
        testID="login-button"
        style={{ marginTop: 20 }}
        onPress={handleSubmit(addExplainUser)}
        leftIcon={<MaterialIcons name="upload-file" size={24} color="#ffffff" />}
      >
        <Text tx="DivisionScreen.devision" style={{ fontWeight: "700", color: "#ffffff" }} />
      </Button>
    </View>
  )
})
const $header: ViewStyle = {
  paddingVertical: 10,
}
const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 20,
  backgroundColor: "#ffffff",
}
