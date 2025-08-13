import { ScrollView, Text, StyleSheet } from "react-native";
import { router } from "expo-router";

const PrivacyPolicy = () => {
  const openContactPage = () => {
    // Replace 'your-privacy-policy-link' with the actual URL of your privacy policy.
    router.replace("/app/(tabs)/profile/settings/Contact.js");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Privacy Policy</Text>
      <Text style={styles.date}>Last Updated: 18/10/2023</Text>

      <Text style={styles.sectionHeader}>1. Information We Collect</Text>
      <Text>
        We collect information you provide directly to us when you use the App.
        This information may include:
      </Text>
      <Text>
        Personal Information: We may collect your name and email address when
        you create an account.
      </Text>
      <Text>
        Location Information: We may collect your device's precise location when
        you enable location-based services.
      </Text>
      <Text>
        Usage Information: We collect information about your interactions with
        the App, including the content you view and your interactions with other
        users.
      </Text>

      <Text style={styles.sectionHeader}>2. How We Use Your Information</Text>
      <Text>
        We may use the information we collect for various purposes, including:
      </Text>
      <Text>- To provide, maintain, and improve the App.</Text>
      <Text>
        - To personalize your experience and deliver content and product
        offerings relevant to your interests.
      </Text>
      <Text>- To respond to your comments, questions, and requests.</Text>
      <Text>- To monitor and analyze usage patterns and trends.</Text>

      <Text style={styles.sectionHeader}>3. Sharing of Your Information</Text>
      <Text>We may share your information as follows:</Text>
      <Text>- With other users when you interact with the App.</Text>
      <Text>- With service providers who perform services on our behalf.</Text>
      <Text>
        - With third parties in response to legal requests, to protect our
        rights, and to protect the rights, property, and safety of others.
      </Text>

      <Text style={styles.sectionHeader}>4. Your Choices</Text>
      <Text>
        Account Information: You may update, correct, or delete your account
        information at any time by contacting us at{" "}
        <Text style={styles.contactLink} onPress={openContactPage}>
          worldbasemap@gmail.com
        </Text>
        .
      </Text>
      <Text>
        Location Information: You can disable location-based services through
        your device settings.
      </Text>

      <Text style={styles.sectionHeader}>5. Security</Text>
      <Text>
        We take reasonable measures to help protect your information from
        unauthorized access, disclosure, alteration, or destruction. However, no
        data transmission over the internet or wireless networks can be
        guaranteed to be 100% secure.
      </Text>

      <Text style={styles.sectionHeader}>
        6. Changes to this Privacy Policy
      </Text>
      <Text>
        We may update this Privacy Policy to reflect changes to our information
        practices. If we make any material changes, we will notify you by email
        (sent to the email address specified in your account) or by means of a
        notice on the App.
      </Text>

      <Text style={styles.sectionHeader}>7. Contact Us</Text>
      <Text>
        If you have any questions about this Privacy Policy, please contact us
        at{" "}
        <Text style={styles.contactLink} onPress={openContactPage}>
          worldbasemap@gmail.com
        </Text>
      </Text>
    </ScrollView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  date: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  contactLink: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
