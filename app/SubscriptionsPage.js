import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import { useRevenueCat } from '../providers/RevenueCatProvider';
import LinearGradient from 'react-native-linear-gradient';
import {router} from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';

const PackageList = () => {
  const { user, packages, purchasePackage, updateCustomerInformation } = useRevenueCat();
  const [isLoading, setIsLoading ] = useState(false);

  console.log('subpage user is',user);

  const handlePurchase = async (pkg) => {
    setIsLoading(true);
    try {
      await purchasePackage(pkg);

      if (user.pro) {
        router.push('/(tabs)/map/Map')
      }
      
    } catch (error) {
      console.error('Failed to purchase package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the user already has access to a specific package
  const userHasAccessToPackage = (pkg) => {
    if (user.pro) {
      return true; // User is a pro
    }
  
    if (user.entitlements && user.entitlements.active) {
      return user.entitlements.active[pkg.product.identifier] !== undefined;
    }
  
    return false; // If entitlements are not available, assume user doesn't have access
  };

  // Assuming you have two packages
  const package1 = packages[0];
  const package2 = packages[1];
  const package3 = packages[2];

  console.log('available packages',packages.length);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/bitmap.png')} // Provide the path to your image
        style={styles.image}
      />
      <Text style={styles.title}>Unlock Pro Features</Text>
      <View style={styles.features}>
        <Text style={styles.featureItem}>- Precise Coordinates</Text>
        <Text style={styles.featureItem}>- Open Locations in Maps</Text>
        <Text style={styles.featureItem}>- Create a Logbook</Text>
        <Text style={styles.featureItem}>- More in depth Location Details</Text>
      </View>
      <View style={styles.bottomContainer}>
        {/* First Package */}
        <LinearGradient colors={['#007AFF', '#00AFFF']} style={styles.package}>
          <Text style={[styles.packageText, {fontSize: 20, textAlign: 'center'}]}>
            Monthly Subscription
          </Text>
          <Text style={styles.packageText}>
            {package1.product.priceString}
          </Text>
          {isLoading ? ( // Check if isLoading is true
            <ActivityIndicator color="white" size="small" /> // Show ActivityIndicator
          ) : userHasAccessToPackage(package1) ? (
            <Text style={styles.accessText}>Already Purchased</Text>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePurchase(package1)}
            >
              <Text style={styles.buttonText}>Purchase</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Second Package */}
        <LinearGradient colors={['#007AFF', '#00AFFF']} style={styles.package}>
        <Text style={[styles.packageText, {fontSize: 20, textAlign: 'center'}]}>
            Yearly Subscription
          </Text>
          <Text style={styles.packageText}>
            {package2.product.priceString}
          </Text>
          {isLoading ? ( // Check if isLoading is true
            <ActivityIndicator color="white" size="small" /> 
          ) : userHasAccessToPackage(package2) ? (
            <Text style={styles.accessText}>Already Purchased</Text>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePurchase(package2)}
            >
              <Text style={styles.buttonText}>Purchase</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
      
      {/* 7-day Trial Button with LinearGradient Effect */}
      <LinearGradient colors={['#007AFF', '#00AFFF']} style={styles.trialButton}>
        <TouchableOpacity onPress={() => handlePurchase(package3)}>
          <Text style={[styles.packageText, { textAlign: 'center'}]}>7-day Free Trial</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Back to Map Button */}
      <TouchableOpacity 
        style={styles.backToMapButton}
        onPress={() => router.push('/(tabs)/map/Map')}
      >
        <Text style={styles.backToMapButtonText}>Back to Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  title: {
    fontSize: 27,
    marginBottom: 10,
    marginTop: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomContainer: {
    flexDirection: 'row', 
  },
  package: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    width: '48%', 
    height: 150,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 5,
  },
  packageText: {
    fontSize: 16,
    marginBottom: 5,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
  accessText: {
    fontSize: 16,
    color: 'gray',
  },
  image: {
    width: 200,
    height: 200,
  },
  features: {
    alignItems: 'flex-start',
    marginTop: 20,
  },
  featureItem: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  backToMapButton: {
    backgroundColor: 'black', // Background color
    padding: 10,
    borderRadius: 8,
    marginTop: 30,
    width: '80%',
  },
  backToMapButtonText: {
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  trialText: {
    color: 'white', 
    fontSize: 18, 
    textAlign: 'center',
  },
  trialButton: {
    backgroundColor: 'black', // Background color
    padding: 10,
    borderRadius: 8,
    marginTop: 30,
    width: '80%',
  }
});

export default PackageList;