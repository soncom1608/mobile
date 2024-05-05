import React, { FC, useCallback, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { SafeAreaView, View, ViewStyle, TextInput, Button } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../navigators"
import { Screen, Text, Header, ToastMessage, ImagePicker } from "../components"
import { useStores } from "../models"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as zod from "zod"
import { useToast } from "native-base"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../models"

// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `ChangeInfor: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="ChangeInfor" component={ChangeInforScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const ChangeInforScreen: FC<StackScreenProps<DivisionParamList, "ChangeInfor">> = observer(
  function ChangeInforScreen({ navigation }) {
    const {
      userStore: { changeUserInfor, email, name, avatar, id, getUserInfo, getCurrentUser },
    } = useStores()
    const [isChange, setIsChange] = useState(false)
    // console.log("user day a", user?.avatar?.name)
    const validationSchema = useMemo(
      () =>
        zod.object({
          email: zod.string({ required_error: "Email là trường bắt buộc" }).nonempty({
            message: "Email không được để trống",
          }),
          name: zod.string({ required_error: "Name là trường bắt buộc" }).nonempty({
            message: "Name không được để trống",
          }),
          avatar: zod
            .any()
            .optional()
            .refine((value) => {
              if (value?.fileSize) return value?.fileSize < 1000000
              return true
            }, "Dung lượng ảnh không được quá 10 MB")
            .refine((value) => {
              if (value?.type) return value?.type === ("image/jpeg" || "image/png" || "image/jpg")
              return true
            }, "Định dạng phải là jpeg,png,jpg"),
        }),
      [],
    )

    const toast = useToast()
    const {
      control,
      handleSubmit,
      setValue,
      formState: { errors },
      trigger,
      reset,
      resetField,
    } = useForm({
      mode: "onChange",
      resolver: zodResolver(validationSchema),
      defaultValues: {
        email: email ?? undefined,
        name: name ?? undefined,
        avatar: avatar ?? undefined,
      },
    })

    const onSubmit = useCallback(
      async (data: any) => {
        try {
          await changeUserInfor(data?.email, data?.name, id, data?.avatar)
          // reset({ avatar: avatar, email: email, name: name })
          setIsChange(false)
          toast.show({
            placement: "top",
            render: () => {
              return <ToastMessage type="success" text="Cập nhật thành công" />
            },
            duration: 1000,
          })
          // await getUserInfo(id)
          await getCurrentUser()
        } catch (e) {
          throw new Error(`${e}`)
        }
      },
      [setIsChange, setIsChange],
    )

    return (
      <Screen style={$root} preset="scroll" safeAreaEdges={["bottom"]}>
        <SafeAreaView>
          <Header
            leftIcon="back"
            title="Thông tin người dùng"
            titleStyle={{ fontWeight: "800" }}
            onLeftPress={() => {
              navigation.goBack()
            }}
            rightText={!isChange ? "Sửa" : "Hủy"}
            onRightPress={() => {
              setIsChange(!isChange)
            }}
          />
          <View style={{ padding: 20 }}>
            <View>
              <Text style={{ marginBottom: 5 }}>Ảnh đại diện</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ImagePicker
                    mediaType="photo"
                    errorMessage={errors?.avatar?.message as string}
                    quanlity={0.5}
                    disable={!isChange}
                    value={value?.name}
                    onchange={(images) => {
                      setValue("avatar", { ...images?.assets?.[0] })
                      trigger("avatar")
                    }}
                    multiPick={false}
                  />
                )}
                name="avatar"
              />
              <Text style={{ marginBottom: 5 }}>Email</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    editable={isChange}
                    placeholder="Email"
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
                name="email"
              />
              {errors.email?.message && (
                <Text style={{ color: "red" }}>{errors.email?.message}</Text>
              )}
              <Text style={{ marginBottom: 5 }}>Tên </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    editable={isChange}
                    placeholder="name"
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
                name="name"
              />

              {errors?.name?.message && (
                <Text style={{ color: "red" }}>{errors?.name?.message}</Text>
              )}
              {isChange && <Button title="Cập nhật" onPress={handleSubmit(onSubmit)} />}
            </View>
          </View>
        </SafeAreaView>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
  backgroundColor: "white",
}
