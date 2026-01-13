/*
 * Vegas Casino LoadRunner Template - Real User Simulation
 * 
 * This template generates HTTP requests identical to real browser users
 * for proper Dynatrace correlation and business event capture
 * 
 * Endpoints simulated:
 * - /api/slots/spin
 * - /api/dice/roll  
 * - /api/blackjack/deal
 * - /api/blackjack/action
 */

#include "web_api.h"
#include "lrun.h"

// Global variables matching real user context
char username[128] = "LoadTest_User_{lr_get_vuser_id()}";
char customer_name[128] = "{{CUSTOMER_NAME}}";
char email[256] = "{{EMAIL}}";
char company_name[128] = "{{COMPANY_NAME}}";
char persona[128] = "{{PERSONA}}";
char booth[64] = "LoadRunner_Booth";
int user_balance = {{INITIAL_BALANCE}};
int cheat_active = {{CHEAT_SIMULATION}};

// Vegas Casino API endpoints
char slots_endpoint[256] = "{{BASE_URL}}/api/slots/spin";
char dice_endpoint[256] = "{{BASE_URL}}/api/dice/roll";
char blackjack_deal_endpoint[256] = "{{BASE_URL}}/api/blackjack/deal";
char blackjack_action_endpoint[256] = "{{BASE_URL}}/api/blackjack/action";

// Request payloads matching real user structure
char slots_payload[2048];
char dice_payload[2048]; 
char blackjack_payload[2048];

Action()
{
    char correlation_id[128];
    char current_timestamp[64];
    int bet_amount;
    int win_amount;
    int new_balance;
    
    // Generate correlation ID matching frontend pattern
    sprintf(correlation_id, "loadtest_%ld_%d_%s", 
            time(NULL), lr_get_vuser_id(), 
            lr_generate_uuid4_string());
    
    // Get current timestamp
    sprintf(current_timestamp, "%ld", time(NULL) * 1000);
    
    lr_start_transaction("Vegas_Casino_Session_Init");
    
    // Set headers identical to real browser requests
    web_add_header("Content-Type", "application/json");
    web_add_header("User-Agent", "Vegas-Casino-UI");
    web_add_header("Accept", "application/json, text/plain, */*");
    web_add_header("Cache-Control", "no-cache");
    
    lr_end_transaction("Vegas_Casino_Session_Init", LR_PASS);
    
    // Simulate Slots Game (identical to real user request)
    lr_start_transaction("Slots_Spin_Simulation");
    
    bet_amount = 25 + (lr_get_vuser_id() % 4) * 25; // Vary bet amounts
    win_amount = (rand() % 2) ? (bet_amount * (1 + rand() % 5)) : 0;
    new_balance = user_balance - bet_amount + win_amount;
    
    // Build slots payload identical to frontend
    sprintf(slots_payload,
        "{"
        "\"game\": \"slots\","
        "\"action\": \"spin\","
        "\"betAmount\": %d,"
        "\"winAmount\": %d,"
        "\"payline\": [\"Seven\", \"Seven\", \"Cherry\"],"
        "\"cheat\": %s,"
        "\"customerName\": \"%s\","
        "\"balance\": %d,"
        "\"newBalance\": %d,"
        "\"Username\": \"%s\","
        "\"CustomerName\": \"%s\","
        "\"Email\": \"%s\","
        "\"CompanyName\": \"%s\","
        "\"Persona\": \"%s\","
        "\"Booth\": \"%s\","
        "\"OptIn\": true,"
        "\"Balance\": %d,"
        "\"BetAmount\": %d,"
        "\"correlationId\": \"%s\","
        "\"CheatActive\": %s,"
        "\"CheatType\": %s,"
        "\"CheatDetails\": %s"
        "}",
        bet_amount, win_amount,
        cheat_active ? "true" : "null",
        customer_name, user_balance, new_balance,
        username, customer_name, email, company_name, persona, booth,
        new_balance, bet_amount, correlation_id,
        cheat_active ? "true" : "false",
        cheat_active ? "\"luckySpins\"" : "null",
        cheat_active ? "{\"winBoost\": 0.3, \"frequency\": 0.2}" : "null"
    );
    
    web_custom_request("Slots_Spin_Request",
        "URL={slots_endpoint}",
        "Method=POST",
        "Resource=0",
        "RecContentType=application/json",
        "Body={slots_payload}",
        LAST);
    
    user_balance = new_balance;
    lr_end_transaction("Slots_Spin_Simulation", LR_PASS);
    
    // Think time matching real user behavior
    lr_think_time(2 + rand() % 4);
    
    // Simulate Dice Game (identical to real user request)  
    lr_start_transaction("Dice_Roll_Simulation");
    
    bet_amount = 50 + (lr_get_vuser_id() % 3) * 50;
    win_amount = (rand() % 3) ? bet_amount * 2 : 0; // Dice typically 2x payout
    new_balance = user_balance - bet_amount + win_amount;
    
    sprintf(dice_payload,
        "{"
        "\"Username\": \"%s\","
        "\"CustomerName\": \"%s\","
        "\"Email\": \"%s\","
        "\"CompanyName\": \"%s\","
        "\"Persona\": \"%s\","
        "\"Booth\": \"%s\","
        "\"OptIn\": true,"
        "\"BetAmount\": %d,"
        "\"balance\": %d,"
        "\"newBalance\": %d,"
        "\"Balance\": %d,"
        "\"BetType\": \"pass\","
        "\"Game\": \"Vegas Dice\","
        "\"Action\": \"RollCompleted\","
        "\"Status\": \"Completed\","
        "\"Result\": \"%s\","
        "\"dice1\": %d,"
        "\"dice2\": %d,"
        "\"sum\": %d,"
        "\"win\": %s,"
        "\"payout\": %d,"
        "\"payoutMultiplier\": %.1f,"
        "\"WinningAmount\": %d,"
        "\"LossAmount\": %d,"
        "\"WinFlag\": %d,"
        "\"Device\": \"LoadRunner-Simulation\","
        "\"CheatActive\": %s,"
        "\"CheatType\": %s,"
        "\"correlationId\": \"%s\""
        "}",
        username, customer_name, email, company_name, persona, booth,
        bet_amount, user_balance, new_balance, new_balance,
        win_amount > 0 ? "win" : "lose",
        3 + rand() % 4, 2 + rand() % 4, 7 + rand() % 5,
        win_amount > 0 ? "true" : "false",
        win_amount, win_amount > 0 ? (float)win_amount / bet_amount : 0.0,
        win_amount, win_amount == 0 ? bet_amount : 0, win_amount > 0 ? 1 : 0,
        cheat_active ? "true" : "false",
        cheat_active ? "\"loadedDice\"" : "null",
        correlation_id
    );
    
    web_custom_request("Dice_Roll_Request",
        "URL={dice_endpoint}",
        "Method=POST", 
        "Resource=0",
        "RecContentType=application/json",
        "Body={dice_payload}",
        LAST);
    
    user_balance = new_balance;
    lr_end_transaction("Dice_Roll_Simulation", LR_PASS);
    
    // Think time
    lr_think_time(1 + rand() % 3);
    
    // Simulate Blackjack Game (identical to real user request)
    lr_start_transaction("Blackjack_Deal_Simulation");
    
    bet_amount = 100;
    
    sprintf(blackjack_payload,
        "{"
        "\"Username\": \"%s\","
        "\"CustomerName\": \"%s\","
        "\"Email\": \"%s\","
        "\"CompanyName\": \"%s\","
        "\"Persona\": \"%s\","
        "\"Booth\": \"%s\","
        "\"OptIn\": true,"
        "\"BetAmount\": %d,"
        "\"balance\": %d,"
        "\"Balance\": %d,"
        "\"Game\": \"Blackjack\","
        "\"Action\": \"Deal\","
        "\"Status\": \"Starting\","
        "\"CheatActive\": %s,"
        "\"CheatType\": %s,"
        "\"correlationId\": \"%s\""
        "}",
        username, customer_name, email, company_name, persona, booth,
        bet_amount, user_balance, user_balance,
        cheat_active ? "true" : "false",
        cheat_active ? "\"cardCounting\"" : "null",
        correlation_id
    );
    
    web_custom_request("Blackjack_Deal_Request",
        "URL={blackjack_deal_endpoint}",
        "Method=POST",
        "Resource=0", 
        "RecContentType=application/json",
        "Body={blackjack_payload}",
        LAST);
    
    lr_end_transaction("Blackjack_Deal_Simulation", LR_PASS);
    
    return 0;
}