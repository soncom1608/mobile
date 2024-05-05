import { observer } from "mobx-react-lite"
import React, { FC, memo, useEffect, useMemo, useRef, useState } from "react"
import { Image, Pressable, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { Icon, Screen, Text, TextFieldAccessoryProps, ChangeLanguage } from "../components"
import { loadString, saveString, remove } from "../utils/storage"
import i18 from "i18n-js"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { ToastMessage } from "../components"
import { Checkbox, useToast, Button, HStack } from "native-base"
import { useNetInfo } from "@react-native-community/netinfo"
import { Entypo, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as zod from "zod"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}
type textProps = {
  fieldName: String
  isRequired?: true
}
const RequiredText = ({ fieldName, isRequired }: textProps) => {
  return (
    <HStack mb={2} key={1}>
      {isRequired && <Text style={{ color: "red" }}>* </Text>}
      <Text style={{ fontWeight: "700" }}>{fieldName}</Text>
    </HStack>
  )
}
// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Home: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Home" component={HomeScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const LoginScreen: FC<LoginScreenProps> = observer(function LoginScreen(_props) {
  // const authPasswordInput = useRef<TextInput>()
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)

  const netInfo = useNetInfo()
  const toast = useToast()
  const [changeLanguage, setChangeLanguage] = useState<boolean>(false)

  const [language, setLanguage] = useState<string>("")

  const {
    authenticationStore: {
      setAuthToken,
      setIsLogin,
      LoginQRApp,
      setIsSaveInforLogin,
      isSaveInforLogin,
    },
    userStore: { getCurrentUser, getUserInfo },
  } = useStores()

  const validationSchema = useMemo(
    () =>
      zod.object({
        user_name: zod.string({ required_error: "Tài khoản là trường bắt buộc" }).trim().nonempty({
          message: "Tài khoản không được để trống",
        }),
        password: zod
          .string({ required_error: "Mật khẩu là trường bắt buộc" })
          .trim()
          .nonempty({
            message: "Mật khẩu không được để trống",
          })
          .min(5, "Mật khẩu tối thiểu 5 kí tự"),
      }),
    [],
  )
  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(validationSchema),
    defaultValues: {
      user_name: undefined,
      password: undefined,
    },
  })

  // const errors: typeof validationErrors = isSubmitted ? validationErrors : ({} as any)

  const login = async () => {
    // return {
    //   status: responseLogin["status"],
    //   id: responseLogin?.inforUser?.id,
    // }
    if (!netInfo.isConnected) {
      toast.show({
        placement: "top",
        render: () => {
          return <ToastMessage text="Vui lòng kiểm tra lại kết nối ! " type="warning" />
        },
      })
    } else {
      const responLogin = await LoginQRApp(getValues("user_name"), getValues("password"))
      if (responLogin?.status == 400 || responLogin?.status == 401) {
        toast.show({
          placement: "top",
          duration: 500,
          render: () => {
            return <ToastMessage text="Sai tài khoản hoặc mật khẩu !" type="warning" />
          },
        })
      } else if (responLogin?.status === 500) {
        toast.show({
          placement: "top",
          render: () => {
            return <ToastMessage text="Lỗi máy chủ !" type="warning" />
          },
        })
      } else if (responLogin?.status === 200) {
        // await getUserInfo(responLogin?.id)
        await getCurrentUser()
        if (isSaveInforLogin) {
          await saveString("user_name", getValues("user_name"))
          await saveString("password", getValues("password"))
          setIsSaveInforLogin(true)
        } else {
          await remove("user_name")
          await remove("password")
          setIsSaveInforLogin(false)
        }
        resetField("password")
        resetField("user_name")
        setIsLogin(true)
      } else {
        toast.show({
          placement: "top",
          render: () => {
            return <ToastMessage text="Lỗi không xác định ! " type="warning" />
          },
        })
      }
    }

    setAuthToken(String(Date.now()))
  }

  // Đóng modal thay đổi ngôn ngữ
  const onClose = (data: boolean) => {
    setChangeLanguage(data)
    // setChangePassword(data)
  }

  // lấy thông tin ngôn ngữ được lưu ở localStorage
  const getLanguage = async () => {
    const lg = await loadString("language")
    if (lg) {
      setLanguage(lg)
    } else {
      const locale = i18.locale.split("-")[0]
      setLanguage(locale)
    }
  }

  const getInforStore = async () => {
    if (isSaveInforLogin) {
      setValue("user_name", await loadString("user_name"))
      setValue("password", await loadString("password"))
    } else {
      setValue("user_name", "")
      setValue("password", "")
    }
  }

  useEffect(() => {
    getInforStore()
    getLanguage()
    return () => {
      getLanguage()
      getInforStore()
    }
  }, [])

  return (
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["top", "bottom"]}
    >
      <Pressable
        onPressIn={() => {
          setChangeLanguage(true)
        }}
        style={{ position: "absolute", top: 20, right: 30 }}
      >
        <FontAwesome5 name="language" size={24} color="#FFC42C" />
      </Pressable>
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("../../assets/icons/iconapp.png")}
          style={{ width: 200, height: 100 }}
        />
      </View>
      <Pressable
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          top: 0,
        }}
      >
        <Text testID="login-heading" tx="loginScreen.signIn" preset="heading" style={$signIn} />
      </Pressable>
      <RequiredText fieldName={"Tài khoản"} />
      <Controller
        name="user_name"
        control={control}
        render={({ field: { value, onBlur, onChange } }) => (
          <TextInput
            placeholder="Nhập tài khoản"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            // containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderColor: "#c3c3c3",
              marginBottom: 10,
              borderRadius: 10,
              paddingLeft: 10,
            }}
          />
        )}
      />
      <Text style={{ color: "red", fontSize: 14 }}>{errors.user_name?.message as string}</Text>
      <RequiredText fieldName={"Mật khẩu"} />
      <Controller
        name="password"
        control={control}
        render={({ field: { value, onBlur, onChange } }) => (
          <TextInput
            placeholder="Nhập mật khẩu"
            secureTextEntry={true}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            // containerStyle={$textField}
            autoCorrect={false}
            // keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderColor: "#c3c3c3",
              marginBottom: 10,
              borderRadius: 10,
              paddingLeft: 10,
            }}
          />
        )}
      />
      <Text style={{ color: "red", fontSize: 14 }}>{errors.password?.message as string}</Text>

      <Checkbox
        value="orange"
        isChecked={isSaveInforLogin}
        onChange={(value) => {
          setIsSaveInforLogin(value)
        }}
      >
        <Text tx="loginScreen.savePassWord" />
      </Checkbox>
      <Button testID="login-button" style={$tapButton} onPress={handleSubmit(login)}>
        <Text
          tx="loginScreen.tapToSignIn"
          style={{ textAlign: "center", fontWeight: "700", color: "white" }}
        />
      </Button>
      {changeLanguage ? (
        <ChangeLanguage
          isChange={true}
          languageStorage={language}
          passing={() => {
            onClose(false)
          }}
        />
      ) : null}
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.huge,
  paddingHorizontal: spacing.large,
  flex: 1,
  position: "relative",
  backgroundColor: "#ffffff",
}

const $signIn: TextStyle = {
  marginBottom: spacing.small,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.large,
}

const $hint: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.medium,
}

const $textField: ViewStyle = {
  marginBottom: spacing.large,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.large,
}

// @demo remove-file
