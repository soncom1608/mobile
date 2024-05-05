import React, { FC, useCallback, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { useNetInfo } from "@react-native-community/netinfo"
// import moment from "moment"
import { dateTimeStamp } from "../utils/common"
import {
  View,
  TextStyle,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { AppStackScreenProps } from "../navigators"
import { Screen, Text, Maps, ToastMessage, ModalLoader } from "../components"
import { useStores } from "../models"
import { Modal, Button, VStack, useToast, HStack, Box } from "native-base"
import { getCurrentPosition } from "../utils/gps"
import { allowCheckin, distance, network } from "../utils/checkin"
import { Entypo } from "@expo/vector-icons"
// import { Pressable } from "../components/pressable"

const TextError: TextStyle = {
  color: "red",
  fontWeight: "bold",
}
// STOP! READ ME FIRST!
// To fix the TS error below, you'll need to add the following things in your navigation config:
// - Add `Qr: undefined` to AppStackParamList
// - Import your screen, and add it to the stack:
//     `<Stack.Screen name="Qr" component={QrScreen} />`
// Hint: Look for the 🔥!

// REMOVE ME! ⬇️ This TS ignore will not be necessary after you've added the correct navigator param type
// @ts-ignore
export const QrScreen: FC<StackScreenProps<AppStackScreenProps, "Qr">> = observer(
  function QrScreen() {
    const [isShowModal, setShowModal] = useState<boolean>(false)
    const [isChange, setChange] = useState<boolean>(false)
    const [location, setLocation] = useState<object>(null)
    // const [disctance, setDistance] = useState<number>(null)
    const [timeCheck, setTime] = useState<object>({})
    const [address, setAddress] = useState<object>({})
    const [networkInfo, setNetworkInfo] = useState<object>({})
    const [isLoading, setLoading] = useState<boolean>(false)
    const {
      placeStore: {
        getAnPlace,
        updatePlace,
        place,
        getAllPlace,
        listPlaces,
        // countChecked,
        // numberPlace,
      },
      timesheetStore: { createTimesheet },
      userStore: { role, checkInStatus, setDateLastCheckIn, setCheckIn, id },
    } = useStores()
    const toast = useToast()
    const netInfo = useNetInfo()
    console.log(checkInStatus)
    // Hiển thị thông báo
    const showToast = (result: object, message: string, errMessage: string) => {
      if (result["kind"] == "ok") {
        toast.show({
          placement: "top",
          render: () => {
            return <ToastMessage tx="common.success" type={"success"} subText={message} />
          },
        })
      } else {
        toast.show({
          placement: "top",
          render: () => {
            return <ToastMessage tx="common.error" type={"error"} subText={errMessage} />
          },
        })
      }
    }

    // Lắng nghe khi thay đổi state
    React.useEffect(() => {
      console.log("useFeect")
      setDateLastCheckIn()
    }, [])

    // Khi quét QR thành công!
    const onSuccess = useCallback(
      async (placeID: string) => {
        console.log(netInfo.isConnected)
        // console.log("Thông tin quét được là: ", e.data)
        // const placeID: string = e.data
        // Lấy thông tin địa điểm dựa vào place id
        const place = await getAnPlace(placeID)
        // console.log("place in QRScreen: -----------------", placeID)

        // Lấy thông tin địa điểm và tính khoảng cách giữa 2 điểm
        let newPosition
        const getLocation = async () => {
          await getCurrentPosition()
            .then((position) => {
              newPosition = position["coords"]
              setLocation(newPosition)
              // console.log("QR Screen: Lấy vị trí thành công!")
              const newPlace = Object.assign(newPosition, place["result"])

              // Kiểm tra thời gian có được phép chấm công hay không
              const timeCheck = allowCheckin(newPlace)

              setTime(timeCheck)

              // Lưu thông tin kiểm tra khoảng cách
              const distanceTemp = distance(newPlace)
              setAddress(distanceTemp)

              // Lưu thông tin kiểm tra mạng
              const networkTemp = network(newPlace)
              setNetworkInfo(networkTemp)

              // Bật Modal
            })
            .catch((err) => {
              console.log("QR Screen err: ", err)
            })

          setShowModal(true)
        }

        getLocation()
      },
      [setAddress, setNetworkInfo, setShowModal, setLocation],
    )

    // Khi xác nhận quét cham cong
    const onCheckin = useCallback(async () => {
      setCheckIn("out")
      setLoading(true)
      const dataPost = {
        name: `Đã chấm vào tại ${place.name}`,
        lat: location["latitude"],
        long: location["longitude"],
        target: place["id"],
        status: "in",
        datetime: dateTimeStamp(new Date().toJSON()),
        address: place["address"],
        user: id,
      }
      const result = await createTimesheet(dataPost)
      setLoading(false)
      setShowModal(false)
      showToast(result, `Đã chấm vào tại ${place.name}`, "")
      await getAllPlace()
    }, [setLoading, setShowModal, showToast, getAllPlace])
    // Khi xác nhận quét kết thúc Cham cong
    const onCheckout = useCallback(async () => {
      setCheckIn("in")
      setLoading(true)
      const dataPost = {
        name: `Đã chấm ra tại ${place.name}`,
        lat: location["latitude"],
        long: location["longitude"],
        target: place["id"],
        status: "out",
        datetime: dateTimeStamp(new Date().toJSON()),
        address: place["address"],
        user: id,
      }
      const result = await createTimesheet(dataPost)
      setLoading(false)
      setShowModal(false)
      showToast(
        result,
        `Kết thúc chấm ra tại ${place.name}`,
        "Vui lòng kiểm tra các điều kiện trước khi thực hiện!",
      )
      await getAllPlace()
    }, [setLoading, setShowModal, showToast, createTimesheet])

    // Cập nhật địa điểm
    const onUpdatePlace = useCallback(async () => {
      setLoading(true)
      const placeBody = {
        wifi_name: networkInfo["name"],
        ip_address: networkInfo["address"],
        mac_address: networkInfo["macAddress"],
        lat: location["latitude"],
        long: location["longitude"],
      }
      const result = await updatePlace(place.id, placeBody)
      console.log("result update place in QR Screen: " + JSON.stringify(result))

      setLoading(false)
      setChange(false)
      showToast(result, `Cập nhật thành công!`, `Cập nhật thất bại!`)
    }, [setLoading, updatePlace, setChange])

    const renderItem = useCallback(({ item }: any) => {
      return (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            onSuccess(item.id)
          }}
          style={{
            marginVertical: 2,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: "#CCCCCC",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Entypo name="location" size={20} color="black" />
            <View style={{ marginLeft: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: "700" }}>{item.name}</Text>
              <Text style={{ fontSize: 12 }}>{item.address}</Text>
            </View>
          </View>

          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#0284c7",
              borderRadius: 20,
            }}
          />
        </TouchableOpacity>
      )
    }, [])
    return (
      <Screen preset="fixed" style={{ paddingTop: 50, backgroundColor: "white", flex: 1 }}>
        <View style={{ marginHorizontal: 20 }}>
          <Text
            style={{ fontSize: 20, textAlign: "center", marginBottom: 10 }}
            tx="QRScreen.currentListPlaces"
          />
          <ModalLoader caption={false} loading={isLoading} />
          <FlatList data={[...listPlaces]} renderItem={renderItem} />

          {isShowModal && place.lat && (
            <>
              <Modal
                isOpen={isShowModal}
                onClose={() => {
                  setShowModal(false)
                }}
                size={"full"}
                // height={"100%"}
              >
                <Modal.Content>
                  <Modal.CloseButton />
                  <Modal.Header>{place.name}</Modal.Header>
                  <Modal.Body>
                    {/* <View style={page}>
          <View style={containerMap}>
            <Maps style={map} MarkerListUser={listPlaces} />
          </View>
        </View> */}
                    <View style={page}>
                      <View style={containerMap}>
                        <Maps
                          style={map}
                          MarkerListUser={[place]}
                          handleClick={(place) => {
                            console.log(place)
                          }}
                        />
                      </View>
                    </View>
                    {/* <Maps
                      MarkerListUser={[place]}
                      handleClick={(place) => {
                        console.log(place)
                      }}
                    /> */}
                    {!timeCheck["pass"] && (
                      <>
                        <Text tx="QRScreen.errTime1" style={TextError} />
                        <Text text={`${timeCheck["timeStart"]}`} style={TextError} />
                        <Text tx="QRScreen.errTime2" style={TextError} />
                        <Text text={`${timeCheck["timeEnd"]}`} style={TextError} />
                        <Text tx="QRScreen.errTime3" style={TextError} />
                        <Text text={`${timeCheck["dateAllow"]}`} style={TextError} />
                      </>
                    )}
                    {address["pass"] == true ? (
                      <Text tx="QRScreen.allowPossitin" />
                    ) : (
                      <>
                        <Text tx="QRScreen.errDistance1" style={TextError} />
                        <Text text={`${address["distance"]}${address["unit"]}`} style={TextError} />
                        <Text tx="QRScreen.errDistance2" style={TextError} />
                        <Text text={`${address["r"]}m`} style={TextError} />
                      </>
                    )}
                    {networkInfo["pass"] == false ? (
                      <VStack style={{ marginTop: 10 }}>
                        <HStack>
                          <Text tx="QRScreen.wrongAddress" style={TextError} />
                          <Text text={`${networkInfo["type"]}`} style={TextError} />
                        </HStack>
                        <HStack>
                          <Text tx="QRScreen.allowedNetwork" style={TextError} />
                          <Text text={`${networkInfo["ipAllow"]}`} style={TextError} />
                        </HStack>
                        <HStack>
                          <Text tx="QRScreen.yourAddress" style={TextError} />
                          <Text text={`${networkInfo["address"]}`} style={TextError} />
                        </HStack>
                        <HStack>
                          <Text tx="QRScreen.allowedNetworkName" style={TextError} />
                          <Text text={`${networkInfo["nameAllow"]}`} style={TextError} />
                        </HStack>
                        <HStack>
                          <Text tx="QRScreen.yourNetworkName" style={TextError} />
                          <Text text={`${networkInfo["name"]}`} style={TextError} />
                        </HStack>
                      </VStack>
                    ) : null}
                    {role !== "user" && (
                      <Button
                        backgroundColor={"transparent"}
                        onPressIn={() => {
                          setChange(true)
                        }}
                      >
                        <Text
                          tx="QRScreen.changePlace"
                          style={{ color: "blue", textDecorationLine: "underline" }}
                        />
                      </Button>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button.Group space={2}>
                      <Button
                        variant="ghost"
                        colorScheme="blueGray"
                        onPress={() => {
                          setShowModal(false)
                        }}
                      >
                        <Text tx="common.cancel" />
                      </Button>
                      {/* {place.status === "in" ? ( */}
                      {checkInStatus === "out" ? (
                        <>
                          {timeCheck["pass"] && networkInfo["pass"] && address["pass"] ? (
                            <Button onPress={onCheckout} w={[48, 48, 72]}>
                              <Text tx="QRScreen.endPatrol" />
                            </Button>
                          ) : (
                            <Button isDisabled w={[48, 48, 72]}>
                              <Text tx="QRScreen.endPatrol" />
                            </Button>
                          )}
                        </>
                      ) : (
                        // <Pressable w={[48, 48, 72]} text="Bắt đầu chấm công" />
                        <>
                          {timeCheck["pass"] && networkInfo["pass"] && address["pass"] ? (
                            <Button onPress={onCheckin} w={[48, 48, 72]}>
                              <Text tx="QRScreen.startPatrol" />
                            </Button>
                          ) : (
                            <Button isDisabled={true} w={[48, 48, 72]}>
                              <Text tx="QRScreen.startPatrol" />
                            </Button>
                          )}
                        </>
                      )}
                    </Button.Group>
                  </Modal.Footer>
                </Modal.Content>
              </Modal>
            </>
          )}
          {isChange && (
            <Modal
              isOpen={isChange}
              onClose={() => {
                setChange(false)
              }}
              size={"full"}
            >
              <Modal.Content>
                <Modal.CloseButton />
                <Modal.Header>Return Policy</Modal.Header>
                <Modal.Body>
                  <VStack>
                    <Text tx="QRScreen.placeInfo" />
                    <HStack>
                      <Text tx="QRScreen.yourAddress" />
                      <Text text={`${networkInfo["address"]}`} />
                    </HStack>
                    <HStack>
                      <Text tx="QRScreen.yourNetworkName" />
                      <Text text={`${networkInfo["name"]}`} />
                    </HStack>
                    <HStack>
                      <Text tx="common.long" />
                      <Text text={`: ${location["longitude"]}`} />
                    </HStack>
                    <HStack>
                      <Text tx="common.lat" />
                      <Text text={`: ${location["latitude"]}`} />
                    </HStack>
                    <HStack>
                      <Text tx="QRScreen.yourMacAddress" />
                      <Text text={`: ${networkInfo["macAddress"]}`} />
                    </HStack>
                  </VStack>
                </Modal.Body>
                <Modal.Footer>
                  <Button.Group space={2}>
                    <Button
                      variant="ghost"
                      colorScheme="blueGray"
                      onPress={() => {
                        setChange(false)
                      }}
                    >
                      <Text tx="common.cancel" />
                    </Button>
                    <Button onPressIn={onUpdatePlace}>
                      <Text style={{ color: "white" }} tx="common.update" />
                    </Button>
                  </Button.Group>
                </Modal.Footer>
              </Modal.Content>
            </Modal>
          )}
        </View>
      </Screen>
    )
  },
)
const styles = StyleSheet.create({
  tabActiveOn: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  tabActiveOff: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  numberActiveOn: {
    backgroundColor: "#164e63",
    paddingHorizontal: 8,
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 2,
    borderRadius: 100,
    fontWeight: "700",
  },
  numberActiveOff: {
    fontSize: 16,
    marginLeft: 1,
  },
})
const page: TextStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
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
