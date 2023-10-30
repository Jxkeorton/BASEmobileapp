import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { useRevenueCat } from '../providers/RevenueCatProvider';

const PackageList = () => {
  const { user, packages, purchasePackage } = useRevenueCat();
  const [purchasedPackage, setPurchasedPackage] = useState(null);

  const handlePurchase = async (pkg) => {
    try {
      await purchasePackage(pkg);
      
    } catch (error) {
      console.error('Failed to purchase package:', error);
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

  console.log(packages);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/bitmap.png')} // Provide the path to your image
        style={styles.image}
      />
      <Text style={styles.title}>Unlock Pro Features</Text>
      <View style={styles.features}>
        <Text style={styles.featureItem}>- Precise Coordinates</Text>
        <Text style={styles.featureItem}>- Open Location in Maps</Text>
        <Text style={styles.featureItem}>- Logbook</Text>
        <Text style={styles.featureItem}>- More Location Details</Text>
      </View>
      {packages.map((pkg) => (
        <View key={pkg.product.identifier} style={styles.package}>
          <Text style={styles.packageText}>
            {pkg.product.title} - {pkg.product.priceString}
          </Text>
          {userHasAccessToPackage(pkg) ? (
            <Text style={styles.accessText}>Already Purchased</Text>
          ) : (
            <Button
              title="Purchase"
              disabled={purchasedPackage === pkg.product.identifier}
              onPress={() => handlePurchase(pkg)}
              color="#007AFF"
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  title: {
    fontSize: 27,
    marginBottom: 10,
    marginTop: 100,
    color:'white',
    fontWeight: 'bold'
  },
  package: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  packageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  accessText: {
    fontSize: 16,
    color: 'green',
  },
  image: {
    width: 200, 
    height: 200,
    position: 'absolute', 
    top: 90, 
  },
  features: {
    alignItems: 'flex-start', 
    marginTop: 20, 
  },
  featureItem: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
    fontWeight:'bold',
  },
});

export default PackageList;
