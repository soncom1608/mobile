import React, { FC, useCallback, useMemo, useState, memo } from "react"
import { observer } from "mobx-react-lite"
import { SafeAreaView, View, ViewStyle, TextInput, Button } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../navigators"
import { Screen, Text, Header, ToastMessage } from "../components"
import { useStores } from "../models"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as zod from "zod"
import { HStack, useToast } from "native-base"
type textProps = {
  fieldName: String
}
const RequiredText = (text: textProps) => {
  return (
    <HStack mb={2}>
      <Text style={{ color: "red" }}>* </Text>
      <Text style={{ fontWeight: "700" }}>{text.fieldName}</Text>
    </HStack>
  )
}
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../models"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `ChangePassword: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const ChangePasswordScreen: FC<StackScreenProps<AppStackScreenProps, "ChangePassword">> =
  observer(function ChangePasswordScreen({ navigation }) {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation()

    const {
      userStore: { changePassword, id },
    } = useStores()
    const [isChange, setIsChange] = useState(false)

    const validationSchema = useMemo(
      () =>
        zod.object({
          crPass: zod
            .string({ required_error: "Mật khẩu hiện tại là trường bắt buộc" })
            .trim()
            .nonempty({
              message: "Mật khẩu hiện tại không được để trống",
            })
            .min(5, "Mật khẩu tối thiểu 5 kí tự"),
          newPass: zod
            .string({ required_error: "Name là trường bắt buộc" })
            .trim()
            .nonempty({
              message: "Mật khẩu mới không được để trống",
            })
            .min(5, "Mật khẩu tối thiểu 5 kí tự"),
          repeatPass: zod
            .string({ required_error: "Name là trường bắt buộc" })
            .trim()
            .nonempty({
              message: "Mật khẩu nhập lại không được để trống",
            })
            .min(5, "Mật khẩu tối thiểu 5 kí tự")
            .refine((value) => {
              if (getValues("newPass")?.length > 0) {
                return !(value !== getValues("newPass"))
              }
              return true
            }, "Mật khẩu nhập lại phải giống mật khẩu mới"),
        }),
      [],
    )

    const toast = useToast()
    const {
      control,
      handleSubmit,
      getValues,
      formState: { errors },
      resetField,
    } = useForm({
      mode: "onChange",
      resolver: zodResolver(validationSchema),
      defaultValues: {
        crPass: undefined,
        newPass: undefined,
        repeatPass: undefined,
      },
    })

    const onSubmit = useCallback(async () => {
      try {
        const value = getValues()
        const response = await changePassword(value["newPass"], id)
        if (response) {
          toast.show({
            duration: 3000,
            placement: "top",
            render: () => {
              return <ToastMessage text="Thay đổi mật khẩu thành công" type="success" />
            },
          })
          setIsChange(false)
          resetField("crPass")
          resetField("repeatPass")
          resetField("newPass")
        }
      } catch (e) {
        toast.show({
          duration: 3000,
          placement: "top",
          render: () => {
            return <ToastMessage text="Thay đổi mật khẩu thất bại" type="error" />
          },
        })
        throw new Error(`${e}`)
      }
    }, [])

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["bottom"]}>
        <SafeAreaView>
          <Header
            leftIcon="back"
            title="Đổi mật khẩu"
            titleStyle={{ fontWeight: "800" }}
            onLeftPress={() => {
              navigation.goBack()
            }}
            style={{ backgroundColor: "white" }}
            rightText={!isChange ? "Sửa" : "Hủy"}
            onRightPress={() => {
              setIsChange(!isChange)
            }}
            containerStyle={{ backgroundColor: "white" }}
          />
          <View style={{ padding: 20 }}>
            <View>
              <RequiredText fieldName={"Mật khẩu hiện tại"} />
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    editable={isChange}
                    placeholder="Mật khẩu hiện tại"
                    secureTextEntry={true}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={{
                      borderWidth: 1,
                      borderColor: "#c3c3c3",
                      marginBottom: 10,
                      borderRadius: 10,
                      paddingLeft: 10,
                    }}
                  />
                )}
                name="crPass"
              />
              {
                <Text style={{ color: "red", fontSize: 12 }}>
                  {errors.crPass?.message as string}
                </Text>
              }
              <RequiredText fieldName={"Mật khẩu mới"} />
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    editable={isChange}
                    placeholder="Mật khẩu mới"
                    secureTextEntry={true}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={{
                      borderWidth: 1,
                      borderColor: "#c3c3c3",
                      marginBottom: 10,
                      borderRadius: 10,
                      paddingLeft: 10,
                    }}
                  />
                )}
                name="newPass"
              />
              {
                <Text style={{ color: "red", fontSize: 12 }}>
                  {errors.newPass?.message as string}
                </Text>
              }
              <RequiredText fieldName={"Nhập lại mật khẩu mới"} />
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    editable={isChange}
                    placeholder="Nhập lại mật khẩu mới"
                    secureTextEntry={true}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={{
                      borderWidth: 1,
                      borderColor: "#c3c3c3",
                      marginBottom: 10,
                      borderRadius: 10,
                      paddingLeft: 10,
                    }}
                  />
                )}
                name="repeatPass"
              />
              {
                <Text style={{ color: "red", fontSize: 12 }}>
                  {errors.repeatPass?.message as string}
                </Text>
              }
              {isChange && <Button title="Cập nhật" onPress={handleSubmit(onSubmit)} />}
            </View>
          </View>
        </SafeAreaView>
      </Screen>
    )
  })

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: "white",
}
