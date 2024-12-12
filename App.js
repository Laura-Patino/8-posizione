import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);

  async function locationPermissionAsync() { //funzione asincrona
    let canUseLocation = false;

    const grantedPermission = await Location.getForegroundPermissionsAsync(); //controllo stato dei permessi
    //console.log("GrantedPermission", grantedPermission.status);  
    if (grantedPermission.status === "granted") { //se ho già i permessi
      canUseLocation = true;
    } else { //altrimenti chiedo i permessi all'utente
      const permissionResponse = await Location.requestForegroundPermissionsAsync();
      console.log("PermissionResponse", permissionResponse);
      if (permissionResponse.granted) {
        canUseLocation = true;
      }
    }
    
    if (canUseLocation) {
      const location = await Location.getCurrentPositionAsync() 
      console.log("OK. Received Location:", location); 

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

  useEffect(() => { 
    locationPermissionAsync().then(() => console.log("---FINE---"));
  }, []);

  if (loading) { 
    return (
      <View style={styles.container}>
        <Text>Caricamento...</Text>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>lat: {currentLocation ? currentLocation.lat : "Loading..."}</Text>
      <Text>lng: {currentLocation ? currentLocation.lng : "Loading..."}</Text>

      <Button title="Click me" onPress={() => console.log('hello')} color="red"/>
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
});
