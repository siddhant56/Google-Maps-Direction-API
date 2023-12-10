import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  Skeleton,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useRef, useState } from "react";

const center = { lat: 48.8584, lng: 2.2945 };

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(/**@type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const originRef =
    useRef(/** @type React.MutableRefObject<HTMLInputElement> */);
  const destinationRef =
    useRef(/** @type React.MutableRefObject<HTMLInputElement> */);

  async function calculateRoute() {
    console.log(originRef.current.value);
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      return;
    }
    const directionService = new window.google.maps.DirectionsService();

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { address: originRef.current.value },
      (results, status) => {
        if (status === "OK") {
          console.log("Latitude is", results[0].geometry.location.lat());
          console.log("Longitude is", results[0].geometry.location.lng());
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      }
    );

    const results = await directionService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: window.google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
    setDistance(results.route[0].legs[0].distance.text);
    setDuration(results.route[0].legs[0].duration.text);
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
  }
  if (!isLoaded) {
    return <SkeletonText />;
  }
  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        {/* Google Maps Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>

      <Box
        p={4}
        borderRadius="lg"
        mt={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="modal"
      >
        <HStack spacing={4}>
          <Autocomplete>
            <Input ref={originRef} type="text" placeholder="Origin" />
          </Autocomplete>
          <Autocomplete>
            <Input ref={destinationRef} type="text" placeholder="Destination" />
          </Autocomplete>

          <ButtonGroup>
            <Button
              onClick={() => {
                calculateRoute();
              }}
              colorScheme="pink"
              type="submit"
            >
              Calculate Route
            </Button>
            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={() => clearRoute()}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: {distance}</Text>
          <Text>Duration: {duration}</Text>
          <IconButton
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => map.panTo(center)}
          />
        </HStack>
      </Box>
    </Flex>
  );
}

export default App;
