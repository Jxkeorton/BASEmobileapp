import { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
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
            if(pack.product.identifier === 'monthly' || 'yearly') {
                setUser({...user, pro: true})
            } 
        } catch (e) {
            console.log(e);
        }
    };

    //update user state based on previous purchases
    const updateCustomerInformation = async (customerInfo) => {
        const newUser = {pro: false};

        if(customerInfo?.entitlements.active['proFeatures'] !== undefined) {
            newUser.pro = true;
        }

        setUser(newUser);
    };

    //restore previous purchases
    const restorePermissions = async () => {
        const customer = await Purchases.restorePurchases();
        return customer;
    };

    const value = {
        restorePermissions,
        user: { pro: false }, 
        packages,
        purchasePackage,
      };
      

    // return empty fragment if provider is not ready 
    if (!isReady) return <></>;

    return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>

};