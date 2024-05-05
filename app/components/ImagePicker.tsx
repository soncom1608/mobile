import * as React from "react"
import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle, Image } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, typography } from "../theme"
import { Text } from "./Text"
import {
  ImagePickerResponse,
  launchImageLibrary,
  MediaType,
  PhotoQuality,
} from "react-native-image-picker"

type PickImage = {
  mediaType: MediaType
  quanlity?: PhotoQuality
  value?: string
  errorMessage?: string
  onchange?(images: ImagePickerResponse): void
  disable: boolean
  multiPick: boolean
}

/**
 * Describe your component here
 */
export const ImagePicker = observer(function ImagePicker(props: PickImage) {
  const { mediaType, quanlity, value, errorMessage, onchange, disable, multiPick } = props
  // const [isStatus, setIsStatus] = React.useState(item?.status)
  const [image, setImage] = React.useState<string | undefined>(
    value ? `http://172.20.10.7:3000/v1/users/getImage?avatarName=${value}` : undefined,
  )

  const openImage = async () => {
    const image = await launchImageLibrary(
      {
        mediaType: mediaType,
        quality: quanlity,
        selectionLimit: multiPick ? 5 : 1,
        // includeBase64: true,
      },
      (response) => {
        if (response && response.assets) {
          onchange(response)
          setImage(response.assets[0].uri)
        } else if (response.didCancel) {
          console.log("closed")
        } else {
          console.log(response.errorMessage, response.errorCode)
        }
      },
    )
  }
  return (
    <View>
      <TouchableOpacity
        disabled={disable}
        style={{
          padding: 15,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 80,
        }}
        onPress={openImage}
      >
        <Text>Chọn ảnh</Text>
        <Image
          source={{ uri: image as string }}
          style={{ width: 50, height: 50, borderRadius: 25 }}
        />
      </TouchableOpacity>
      {errorMessage && <Text style={{ fontSize: 12, color: "red" }}>{errorMessage}</Text>}
    </View>
  )
})

const $container: ViewStyle = {
  justifyContent: "center",
}

const $text: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.primary500,
}
