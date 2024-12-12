import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [trackedLocation, setTrackedLocation] = useState(null);
  const trackingSubsription = useRef(null);

  async function locationPermissionAsync() { 
    let canUseLocation = false;

    const grantedPermission = await Location.getForegroundPermissionsAsync(); //controllo stato dei permessi
    //console.log("GrantedPermission", grantedPermission.status);  
    if (grantedPermission.status === "granted") { //se ho già i permessi
      canUseLocation = true;
    } else { //altrimenti chiedo i permessi all'utente
      const permissionResponse = await Location.requestForegroundPermissionsAsync();
      console.log("PermissionResponse", permissionResponse);
      if (permissionResponse.granted) canUseLocation = true;
    }
    
    //if (!canUseLocation) return;

    if (canUseLocation) {
      const location = await Location.getCurrentPositionAsync() 
      //console.log("OK. Received Location:", location); 

      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      setLoading(false);
    } else {
      console.log("Location not granted!!"); 
      //se l'utente non ha dato i permessi non può fare l'ordine.
      //Bottone di Acquisto può essere disabilitato oppure se lo premo appare un Alert.
    }
  }

  async function initTrackLocation() {
    let count = 1;
    console.log("Inizio Tracking...");

    const subscription = await Location.watchPositionAsync( //restituisce un metodo remove 
      { //options
        timeInterval: 4000, //only Android
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 0, //Distanza minima tra ogni aggiornamento
      }, 
      (location) => { //callback
        setTrackedLocation(location.coords);
        console.log({ ...location.coords, increment: count++});
      }
    );

    trackingSubsription.current = subscription;
  }

  useEffect(() => { 
    locationPermissionAsync().then(() => console.log("---FINE---"));
    initTrackLocation(); //avviata insieme a locationPermissionAsync, al primo avvio non funziona
    
    return () => { //Allo smontare della componente viene terminata l'iscrizione
      if (trackingSubsription.current !== null)
        trackingSubsription.current.remove();
    };
    
  }, []);

  /*if (currentLocation === null || trackedLocation === null ) { 
    return (
      <View style={styles.container}>
        <Text>Caricamento...</Text>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }*/

  return (
    <View style={styles.container}>
      {currentLocation === null ? (
        <Text>Loading current Location ...</Text>
      ) : (
        <View>
          <Text style={styles.bigText}>Posizione corrente</Text>
          <Text>lat: {currentLocation ? currentLocation.lat : "Loading..."}</Text>
          <Text>lng: {currentLocation ? currentLocation.lng : "Loading..."}</Text>

          <Button title="Click me" onPress={() => console.log('hello')} color="red"/>
        </View>
      )}
      <View style={{ marginVertical: 20 }}/>
      {trackedLocation === null ? (
        <Text>Loading tracked location...</Text>
      ) : (
        <View>
          <Text style={styles.bigText}>Posizione tracking </Text>
          <Text>lat: {trackedLocation.latitude}</Text>
          <Text>lng: {trackedLocation.longitude}</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigText: {
    fontSize: 24,
    fontWeight: 'bold',
  }
});
