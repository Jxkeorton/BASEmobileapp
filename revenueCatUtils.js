// Initialize RevenueCat
    const initializeRevenueCat = useCallback(async () => {
        try {

            // Using LOG_LEVEL correctly
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);

            if (Platform.OS === 'android') {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.google });
            } else {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.apple });
            }

            Purchases.addCustomerInfoUpdateListener((customerInfo) => {
                // update state with customer info ? 
            });

            const [offerings, customerInfo] = await Promise.all([
                Purchases.getOfferings(),
                Purchases.getCustomerInfo()
            ]);

            return {offerings, customerInfo} // or add to state (this includes the packages available)

        } catch (error) {
            console.error('❌ RevenueCat initialization error:', error);
            // Even if RevenueCat fails, mark as ready so app doesn't hang
            updateNestedState('subscription', { isReady: true });
        } finally {
            updateNestedState('loading', { subscription: false });
        }
    }, [updateNestedState]);

    const handlePurchasePackage = useCallback(async (pack) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);


            return { customerInfo }; // or add to state
        } catch (error) {
            return { success: false, error: error.message };
        }
    }, [updateNestedState]);