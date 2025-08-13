import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';


const TermsAndConditionsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Terms and Conditions</Text>
      <Text style={styles.date}>Last Updated: 28/10/2023</Text>

      <Text style={styles.sectionHeader}>1. Interpretation and Definitions</Text>
      <Text>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</Text>

      <Text style={styles.sectionHeader}>2. Definitions</Text>
      <Text>For the purposes of these Terms and Conditions:</Text>
      <Text>- <Text style={styles.strongText}>Application</Text> means the software program provided by the Company downloaded by You on any electronic device, named BASE map</Text>
      <Text>- <Text style={styles.strongText}>Application Store</Text> means the digital distribution service operated and developed by Apple Inc. (Apple App Store) or Google Inc. (Google Play Store) in which the Application has been downloaded.</Text>
      <Text>- <Text style={styles.strongText}>Affiliate</Text> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</Text>
      <Text>- <Text style={styles.strongText}>Account</Text> means a unique account created for You to access our Service or parts of our Service.</Text>
      <Text>- <Text style={styles.strongText}>Country</Text> refers to: United Kingdom</Text>
      <Text>- <Text style={styles.strongText}>Company</Text> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to BASE map.</Text>
      <Text>- <Text style={styles.strongText}>Device</Text> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</Text>
      <Text>- <Text style={styles.strongText}>Feedback</Text> means feedback, innovations or suggestions sent by You regarding the attributes, performance or features of our Service.</Text>
      <Text>- <Text style={styles.strongText}>Service</Text> refers to the Application.</Text>
      <Text>- <Text style={styles.strongText}>Subscriptions</Text> refer to the services or access to the Service offered on a subscription basis by the Company to You.</Text>
      <Text>- <Text style={styles.strongText}>Terms and Conditions</Text> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.</Text>
      <Text>- <Text style={styles.strongText}>Third-party Social Media Service</Text> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.</Text>
      <Text>- <Text style={styles.strongText}>You</Text> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</Text>

      <Text style={styles.sectionHeader}>3. Acknowledgment</Text>
      <Text>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</Text>
      <Text>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users, and others who access or use the Service.</Text>
      <Text>By accessing or using the Service, You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions, then You may not access the Service.</Text>
      <Text>Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.</Text>

      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  strongText: {
    fontWeight: 'bold',
  },
});

export default TermsAndConditionsScreen;
