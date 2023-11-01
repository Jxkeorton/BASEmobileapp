import { createContext, useContext, useEffect, useState } from 'react'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'

// Revenue cat api key
const APIKeys = {
    apple: 'appl_oLqVDrPIayWzOFHVqVjutudHSZV',
    google: 'nullfornow'
};

const RevenueCatContext = createContext()

// export context for easy use
export const useRevenueCat = () => {
    return useContext(RevenueCatContext);
};

// Revenue cat functions 
export const RevenueCatProvider = ({children}) => {
    const [user, setUser] = useState({pro: false});
    const [packages, setPackages] = useState([]);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
           
            Purchases.configure({apiKey: APIKeys.apple });
            
            setIsReady(true);

            Purchases.setLogLevel(LOG_LEVEL.DEBUG);

            Purchases.addCustomerInfoUpdateListener((customerInfo) => {
                console.log('customerinfo', customerInfo);

                updateCustomerInformation(customerInfo);
            });

            await loadOfferings();
            console.log('init user...',user);
            
        };

        init();
    }, []);

    // load offerings
    const loadOfferings = async () => {
        const offerings = await Purchases.getOfferings();
        console.log('offerings:', offerings);

        const currentOffering = offerings.current;
        if(currentOffering) {
            setPackages(currentOffering.availablePackages);
        }
    };

    //Purchase a package
    const purchasePackage = async (pack) => {
        try{
            await Purchases.purchasePackage(pack);

            // update user state 
            if(pack.product.identifier === 'monthly' || pack.product.identifier === 'yearly') {
                setUser({...user, pro: true})
            } 

            // Update user state based on customer information
            const customerInfo = await Purchases.getPurchaserInfo();
            updateCustomerInformation(customerInfo);
        } catch (e) {
            console.log(e);
        }
    };

    //update user state based on previous purchases
    const updateCustomerInformation = async (customerInfo) => {
        const newUser = {pro: false};

        console.log('update customer info... proFeatures is :',customerInfo.entitlements.active);
        if (
            customerInfo.entitlements.active["proFeatures"] !== undefined
          ) {
            // Check if the 'proFeatures' entitlement is not empty or falsy
            newUser.pro = true;
          }
          console.log('newUser',newUser);
          setUser(newUser);
    };

    //restore previous purchases
    const restorePermissions = async () => {
        const customer = await Purchases.restorePurchases();
        return customer;
    };

    const value = {
        restorePermissions,
        user: user, 
        packages,
        purchasePackage,
      };
      

    // return empty fragment if provider is not ready 
    if (!isReady) return <></>;

    return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>

};