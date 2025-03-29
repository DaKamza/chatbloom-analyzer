
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get request data
    const { transaction_id, product_name, amount, user_id } = await req.json();
    
    if (!transaction_id || !product_name || !amount || !user_id) {
      throw new Error("Missing required fields");
    }
    
    console.log(`Processing payment: ${transaction_id} for ${product_name}`);
    
    // 1. Record the payment transaction
    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user_id,
        amount: amount,
        payment_method: "PayPal",
        transaction_id: transaction_id,
        payment_status: "completed",
        product_name: product_name
      });
      
    if (transactionError) {
      console.error("Transaction record error:", transactionError);
      throw new Error(`Failed to record transaction: ${transactionError.message}`);
    }
    
    // 2. Update user's premium status
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("id", user_id);
      
    if (profileError) {
      console.error("Profile update error:", profileError);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }
    
    // 3. Grant premium features based on the product purchased
    const premiumFeatures = [];
    
    // Add appropriate features based on product name
    if (product_name.includes("All Features") || product_name.includes("ALL_INCLUSIVE")) {
      premiumFeatures.push(
        { user_id, feature_name: "conflict_analysis", is_active: true },
        { user_id, feature_name: "relationship_advice", is_active: true },
        { user_id, feature_name: "sentiment_analysis", is_active: true },
        { user_id, feature_name: "advanced_insights", is_active: true }
      );
    } else if (product_name.includes("Premium Monthly") || product_name.includes("PREMIUM_MONTHLY")) {
      // Set an expiry date for subscription (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      premiumFeatures.push(
        { user_id, feature_name: "conflict_analysis", is_active: true, expiry_date: expiryDate.toISOString() },
        { user_id, feature_name: "relationship_advice", is_active: true, expiry_date: expiryDate.toISOString() },
        { user_id, feature_name: "advanced_insights", is_active: true, expiry_date: expiryDate.toISOString() }
      );
    } else if (product_name.includes("ONE_TIME_FEATURES")) {
      premiumFeatures.push(
        { user_id, feature_name: "conflict_analysis", is_active: true },
        { user_id, feature_name: "mood_analysis", is_active: true }
      );
    }
    
    // Insert the premium features
    if (premiumFeatures.length > 0) {
      const { error: featuresError } = await supabase
        .from("premium_features")
        .insert(premiumFeatures);
        
      if (featuresError) {
        console.error("Feature insertion error:", featuresError);
        throw new Error(`Failed to add premium features: ${featuresError.message}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Payment verified and premium features activated",
        features: premiumFeatures.map(f => f.feature_name)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
