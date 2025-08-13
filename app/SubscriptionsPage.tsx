import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {router} from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useAuth } from '../providers/AuthProvider';
import {CustomerInfo, PurchasesPackage} from 'react-native-purchases';

const PackageList = () => {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading ] = useState(false);

  // TODO: Add back revenue cat logic
  const isProUser = true
  const purchasePackage = async (pkg: PurchasesPackage): Promise<CustomerInfo> => {
    // Placeholder implementation
    return new Promise((resolve) => {
      resolve({} as CustomerInfo);
    });
  }
  const packages = [] as PurchasesPackage[];

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setIsLoading(true);
    try {
      const result: CustomerInfo = await purchasePackage(pkg);

      if (isProUser) { 
        router.push('/(tabs)/map/Map');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to purchase package',
          text2: 'An error occurred during the purchase process.',
          position: 'top',
        });
      }
      
    } catch (error) {
      console.error('Failed to purchase package:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to purchase package',
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userHasAccessToPackage = (pkg: PurchasesPackage) => {
    if (isProUser) {
      return true;
    }
  
    if (user?.entitlements?.active) {
      return user.entitlements.active[pkg.product.identifier] !== undefined;
    }
  
    return false;
  };

  if (loading.subscription) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.title}>Loading packages...</Text>
      </View>
    );
  }

  const package1 = packages[0];
  const package2 = packages[1];

  if (!package1 || !package2) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.title}>No packages available</Text>
        <TouchableOpacity 
          style={styles.backToMapButton}
          onPress={() => router.push('/(tabs)/map/Map')}
        >
          <Text style={styles.backToMapButtonText}>Back to Map</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/bitmap.png')}
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
          {isLoading || loading.action ? (
            <ActivityIndicator color="white" size="small" />
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
          {isLoading || loading.action ? (
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
      {!(isLoading || loading.action) && (
      <View style={styles.trialContainer}>
        <Text style={styles.trialText}>A 7 Day Free trial will be applied if it is your first time subscribing</Text>
      </View> )}

      {/* Back to Map Button */}
      {isLoading || loading.action ? (
       <Text style={styles.backToMapButtonText}>Please wait...</Text>
      ) : (
        <TouchableOpacity 
        style={styles.backToMapButton}
        onPress={() => router.push('/(tabs)/map/Map')}
      >
        <Text style={styles.backToMapButtonText}>Back to Map</Text>
      </TouchableOpacity>
      )}
      
    </View>
  );
};

// Styles remain the same
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
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 8,
    marginTop: 30,
    width: '80%',
  },
  backToMapButtonText: {
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  trialText: {
    color: 'white', 
    fontSize: 14, 
    textAlign: 'center',
  },
  trialContainer: {
    marginTop: 20,
    marginHorizontal:20,
  }
});

export default PackageList;