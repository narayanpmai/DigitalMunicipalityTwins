import sys
import psycopg2

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'
TENANT_ID = 'panchpokhari'

sys.stdout.reconfigure(encoding="utf-8")

# All Nepali strings as unicode literals
J68  = "\u091c\u0947\u0937\u094d\u0920 \u0928\u093e\u0917\u0930\u093f\u0915 (\u0968\u096e \u0935\u0930\u094d\u0937 \u092e\u093e\u0925\u093f)"
J60D = "\u091c\u0947\u0937\u094d\u0920 \u0928\u093e\u0917\u0930\u093f\u0915 \u0926\u0932\u093f\u0924 (\u0968\u096a \u0935\u0930\u094d\u0937 \u092e\u093e\u0925\u093f)"
EK60 = "\u090f\u0915\u0932 \u092e\u0939\u093f\u0932\u093e / \u0935\u093f\u0927\u0935\u093e (\u0968\u096a \u0935\u0930\u094d\u0937 \u092e\u093e\u0925\u093f)"
AKA  = "\u092a\u0942\u0930\u094d\u0923 \u0905\u092a\u093e\u0919\u094d\u0917\u0924\u093e (\u0915 \u0935\u0930\u094d\u0917 - \u0930\u093e\u0924\u094b \u0915\u093e\u0930\u094d\u0921)"
AKHA = "\u0905\u0924\u093f \u0905\u0936\u0915\u094d\u0924 \u0905\u092a\u093e\u0919\u094d\u0917\u0924\u093e (\u0916 \u0935\u0930\u094d\u0917 - \u0928\u0940\u0932\u094b \u0915\u093e\u0930\u094d\u0921)"
BAL  = "\u092c\u093e\u0932\u092c\u093e\u0932\u093f\u0915\u093e \u092a\u094b\u0937\u0923 \u092d\u0924\u094d\u0924\u093e (\u096b \u0935\u0930\u094d\u0937 \u092e\u0941\u0928\u093f)"
LOP  = "\u0932\u094b\u092a\u094b\u0928\u094d\u092e\u0941\u0916 \u0906\u0926\u093f\u0935\u093e\u0938\u0940 / \u091c\u0928\u091c\u093e\u0924\u093f"

SAK  = "\u0938\u0915\u094d\u0930\u093f\u092f"
NAV  = "\u0928\u0935\u0940\u0915\u0943\u0924"
PUR  = "\u092a\u0941\u0930\u0941\u0937"
MAH  = "\u092e\u0939\u093f\u0932\u093e"
FY   = "\u0968\u0966\u096f\u0967/\u0966\u096f\u0968"
REN  = "\u0968\u0966\u096f\u0967-\u0966\u0969-\u0966\u0967"

NMB  = "\u090f\u0928\u090f\u092e\u092c\u0940 \u092c\u0948\u0902\u0915"
RBB  = "\u0930\u093e\u0937\u094d\u0920\u094d\u0930\u093f\u092f \u092c\u093e\u0923\u093f\u091c\u094d\u092f \u092c\u0948\u0902\u0915"
ADB  = "\u0915\u0943\u0937\u093f \u0935\u093f\u0915\u093e\u0938 \u092c\u0948\u0902\u0915"
NBL  = "\u0928\u092c\u093f\u0932 \u092c\u0948\u0902\u0915"
NPB  = "\u0928\u0947\u092a\u093e\u0932 \u092c\u0948\u0902\u0915 \u0932\u093f\u092e\u093f\u091f\u0947\u0921"

# SSA data - (id, benefId, fullName, fullNameEn, citizen, cat, ward, tole, gender, dob, phone, guardian, bank, acct, status)
SSA = [
  # WARD 1
  ("ssa-w1-001","SSIS-2081-W01-0001","\u0927\u0928 \u092c\u0939\u093e\u0926\u0941\u0930 \u0924\u093e\u092e\u093e\u0919","Dhan Bahadur Tamang","27-01-52-00114",J68,1,"\u092f\u093e\u0919\u094d\u0917\u094d\u0930\u0940",PUR,"1990-02-15","9841001001","\u092c\u093f\u092e\u0932 \u0924\u093e\u092e\u093e\u0919",NMB,"00100000000001",SAK),
  ("ssa-w1-002","SSIS-2081-W01-0002","\u092e\u093e\u092f\u093e \u0924\u093e\u092e\u093e\u0919","Maya Tamang","27-01-55-00218",EK60,1,"\u0917\u094b\u0932\u092e\u093e\u0922\u0940",MAH,"1995-07-20","9841001002","-",RBB,"00100000000002",SAK),
  ("ssa-w1-003","SSIS-2081-W01-0003","\u0906\u092f\u0941\u0937 \u0917\u0941\u0930\u0941\u0919","Ayush Gurung","NID-2081-00301",BAL,1,"\u092f\u093e\u0919\u094d\u0917\u094d\u0930\u0940",PUR,"2079-03-01","9841001003","\u0938\u0941\u0930\u0947\u0936 \u0917\u0941\u0930\u0941\u0919",NMB,"00100000000003",SAK),
  ("ssa-w1-004","SSIS-2081-W01-0004","\u0930\u093e\u092e\u0915\u0941\u092e\u093e\u0930\u0940 \u0924\u093e\u092e\u093e\u0919","Ramkumari Tamang","27-01-50-00412",J60D,1,"\u0917\u094b\u0932\u092e\u093e\u0922\u0940 \u092e\u093e\u0925\u093f",MAH,"1992-12-05","9841001004","\u0938\u0941\u0930\u094d\u091c\u092e\u093e\u0928",ADB,"00100000000004",SAK),
  ("ssa-w1-005","SSIS-2081-W01-0005","\u092b\u0941\u0930\u094d\u092c\u093e \u0936\u0947\u0930\u094d\u092a\u093e","Phurba Sherpa","27-01-60-00501",AKA,1,"\u092f\u093e\u0919\u094d\u0917\u094d\u0930\u0940 \u091a\u094c\u0915",PUR,"2020-05-10","9841001005","\u092a\u0947\u092e\u094d\u092c\u093e",NPB,"00100000000005",SAK),
  ("ssa-w1-006","SSIS-2081-W01-0006","\u092e\u0928\u092c\u0939\u093e\u0926\u0941\u0930 \u0939\u093e\u092f\u0941","Manbahadur Hayu","27-01-58-00612",LOP,1,"\u092f\u093e\u0919\u094d\u0917\u094d\u0930\u0940 \u0924\u0932\u094d\u0932\u094b",PUR,"2015-09-03","9841001006","-",NMB,"00100000000006",SAK),
  # WARD 2
  ("ssa-w2-001","SSIS-2081-W02-0001","\u0915\u0943\u0937\u094d\u0923 \u092c\u0939\u093e\u0926\u0941\u0930 \u0925\u092a\u0932\u093f\u092f\u093e","Krishna Bahadur Thapalia","27-01-48-00701",J68,2,"\u092c\u0930\u094d\u0935\u093e",PUR,"1988-03-20","9841002001","\u0917\u0923\u0947\u0936",RBB,"00200000000001",SAK),
  ("ssa-w2-002","SSIS-2081-W02-0002","\u0938\u0941\u0928\u092e\u093e\u092f\u093e \u0936\u094d\u0930\u0947\u0937\u094d\u0920","Sunmaya Shrestha","27-01-53-00802",EK60,2,"\u0917\u0948\u0916\u0941\u0930",MAH,"1993-06-15","9841002002","-",NBL,"00200000000002",NAV),
  ("ssa-w2-003","SSIS-2081-W02-0003","\u0928\u0930 \u092e\u093e\u092f\u093e \u092a\u0930\u093f\u092f\u093e\u0930","Nar Maya Pariyar","27-01-57-00903",J60D,2,"\u092c\u0930\u094d\u0935\u093e \u0924\u0932\u094d\u0932\u094b",MAH,"1996-01-07","9841002003","\u0930\u0924\u0928",ADB,"00200000000003",SAK),
  ("ssa-w2-004","SSIS-2081-W02-0004","\u0926\u093f\u0932 \u092c\u0939\u093e\u0926\u0941\u0930 \u0930\u093e\u0908","Dil Bahadur Rai","27-01-62-01002",AKHA,2,"\u0917\u0948\u0916\u0941\u0930 \u092e\u093e\u0925\u093f",PUR,"2025-02-02","9841002004","\u0939\u0930\u094d\u0915",NMB,"00200000000004",SAK),
  ("ssa-w2-005","SSIS-2081-W02-0005","\u0938\u0928\u0941 \u092e\u093e\u092f\u093e \u092e\u0917\u0930","Sanu Maya Magar","NID-2081-00501",BAL,2,"\u092c\u0930\u094d\u0935\u093e",MAH,"2078-09-12","9841002005","\u092c\u0941\u0926\u094d\u0927\u093f\u092e\u093e\u0928",RBB,"00200000000005",SAK),
  ("ssa-w2-006","SSIS-2081-W02-0006","\u091c\u0928\u0915 \u092c\u0939\u093e\u0926\u0941\u0930 \u0932\u093e\u092e\u093e","Janak Bahadur Lama","27-01-55-01106",LOP,2,"\u0917\u0948\u0916\u0941\u0930 \u0921\u093e\u0901\u0921\u093e",PUR,"1997-04-08","9841002006","-",NBL,"00200000000006",SAK),
  # WARD 3
  ("ssa-w3-001","SSIS-2081-W03-0001","\u0939\u0930\u093f \u0915\u0943\u0937\u094d\u0923 \u0928\u094d\u092f\u094c\u092a\u093e\u0928\u0947","Hari Krishna Neupane","27-01-46-01201",J68,3,"\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a",PUR,"1987-05-01","9841003001","\u0928\u0930\u0947\u0936",NMB,"00300000000001",SAK),
  ("ssa-w3-002","SSIS-2081-W03-0002","\u0926\u0941\u0930\u094d\u0917\u093e \u0926\u0947\u0935\u0940 \u092a\u094c\u0921\u0947\u0932","Durga Devi Poudel","27-01-54-01302",EK60,3,"\u0915\u093e\u092d\u094d\u0930\u0947\u092a\u093e\u0916\u093e",MAH,"1994-08-02","9841003002","-",ADB,"00300000000002",NAV),
  ("ssa-w3-003","SSIS-2081-W03-0003","\u091c\u094b\u0917\u092e\u093e\u092f\u093e \u092e\u093f\u091c\u093e\u0930","Jogmaya Mijar","27-01-59-01403",J60D,3,"\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a \u092e\u093e\u0925\u093f",MAH,"1992-11-14","9841003003","\u0936\u093e\u0928\u094d\u0924\u093f",NPB,"00300000000003",SAK),
  ("ssa-w3-004","SSIS-2081-W03-0004","\u0928\u093f\u092e\u093e \u0926\u094b\u0930\u094d\u091c\u0947 \u0924\u093e\u092e\u093e\u0919","Nima Dorje Tamang","NID-2081-00401",BAL,3,"\u0915\u093e\u092d\u094d\u0930\u0947\u092a\u093e\u0916\u093e",PUR,"2078-05-20","9841003004","\u092a\u0947\u092e\u094d\u092c\u093e",NMB,"00300000000004",SAK),
  ("ssa-w3-005","SSIS-2081-W03-0005","\u092a\u094d\u0930\u0915\u093e\u0936 \u0925\u093e\u092a\u093e","Prakash Thapa","27-01-61-01501",AKA,3,"\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a \u0924\u0932\u094d\u0932\u094b",PUR,"2018-07-15","9841003005","\u0917\u0919\u094d\u0917\u093e",RBB,"00300000000005",SAK),
  ("ssa-w3-006","SSIS-2081-W03-0006","\u0939\u093f\u0930\u093e \u092e\u093e\u092f\u093e \u0930\u093e\u0908","Hira Maya Rai","27-01-56-01602",AKHA,3,"\u0915\u093e\u092d\u094d\u0930\u0947\u092a\u093e\u0916\u093e \u0924\u0932\u094d\u0932\u094b",MAH,"2022-04-12","9841003006","\u0938\u0941\u0928\u093f\u0932",NBL,"00300000000006",SAK),
  # WARD 4
  ("ssa-w4-001","SSIS-2081-W04-0001","\u092e\u093f\u0919\u094d\u092e\u093e\u0930 \u0932\u093e\u092e\u093e","Mingmar Lama","27-01-49-01601",J68,4,"\u0925\u093e\u0919\u092a\u093e\u0932\u0916\u0930\u094d\u0915",PUR,"1989-04-09","9841004001","\u0906\u0919 \u0921\u094b\u0932\u094d\u092e\u093e",NBL,"00400000000001",SAK),
  ("ssa-w4-002","SSIS-2081-W04-0002","\u0926\u0947\u0935\u0940 \u092e\u093e\u092f\u093e \u0924\u093e\u092e\u093e\u0919","Devi Maya Tamang","27-01-56-01702",EK60,4,"\u092e\u093e\u0928\u0947\u0916\u0930\u094d\u0915 \u0924\u0932\u094d\u0932\u094b",MAH,"1997-09-21","9841004002","-",NMB,"00400000000002",NAV),
  ("ssa-w4-003","SSIS-2081-W04-0003","\u0926\u093e\u0935\u093e \u0936\u0947\u0930\u094d\u092a\u093e","Dawa Sherpa","27-01-58-01803",LOP,4,"\u092e\u093e\u0928\u0947\u0916\u0930\u094d\u0915 \u092e\u093e\u0925\u093f",PUR,"2015-11-10","9841004003","-",ADB,"00400000000003",SAK),
  ("ssa-w4-004","SSIS-2081-W04-0004","\u0915\u093e\u0932\u0941 \u092c\u0939\u093e\u0926\u0941\u0930 \u092c\u093f\u0915","Kalu Bahadur Bik","27-01-52-01904",J60D,4,"\u0925\u093e\u0919\u092a\u093e\u0932\u0916\u0930\u094d\u0915",PUR,"1993-01-15","9841004004","\u0926\u0947\u0935 \u092c\u0939\u093e\u0926\u0941\u0930",RBB,"00400000000004",SAK),
  ("ssa-w4-005","SSIS-2081-W04-0005","\u0938\u093f\u0930\u094d\u091c\u0928\u093e \u0925\u093e\u092a\u093e","Sirjana Thapa","NID-2081-00801",BAL,4,"\u092e\u093e\u0928\u0947\u0916\u0930\u094d\u0915 \u092c\u091c\u093e\u0930",MAH,"2079-07-03","9841004005","\u0915\u092e\u0932\u093e",NPB,"00400000000005",SAK),
  ("ssa-w4-006","SSIS-2081-W04-0006","\u0930\u093f\u092e\u094d\u0924\u0940 \u0924\u093e\u092e\u093e\u0919","Rimti Tamang","27-01-62-02006",AKHA,4,"\u092e\u093e\u0928\u0947\u0916\u0930\u094d\u0915 \u0924\u0932\u094d\u0932\u094b",MAH,"2022-03-05","9841004006","\u091b\u093f\u0930\u093f\u0919",NBL,"00400000000006",SAK),
  # WARD 5
  ("ssa-w5-001","SSIS-2081-W05-0001","\u0938\u094b\u092e\u092c\u0939\u093e\u0926\u0941\u0930 \u0915\u093e\u0930\u094d\u0915\u0940","Sombahadur Karki","27-01-47-02101",J68,5,"\u0915\u093f\u0935\u0940",PUR,"1987-10-02","9841005001","\u092e\u094b\u0939\u0928",NMB,"00500000000001",SAK),
  ("ssa-w5-002","SSIS-2081-W05-0002","\u0938\u0930\u0938\u094d\u0935\u0924\u0940 \u0918\u0930\u094d\u0924\u0940","Saraswati Gharti","27-01-55-02202",EK60,5,"\u0939\u0947\u0935\u093e \u0921\u093e\u0901\u0921\u093e",MAH,"1995-05-15","9841005002","-",ADB,"00500000000002",NAV),
  ("ssa-w5-003","SSIS-2081-W05-0003","\u0930\u093e\u092e\u0932\u093e\u0932 \u0938\u093e\u0930\u094d\u0915\u0940","Ramlal Sarki","27-01-57-02303",J60D,5,"\u0915\u093f\u0935\u0940 \u0924\u0932\u094d\u0932\u094b",PUR,"1997-03-25","9841005003","\u091c\u092f",NPB,"00500000000003",SAK),
  ("ssa-w5-004","SSIS-2081-W05-0004","\u0906\u0936\u093e \u0938\u0941\u0928\u0941\u0935\u093e\u0930","Asha Sunuwar","27-01-60-02404",AKA,5,"\u0939\u0947\u0935\u093e",MAH,"2019-08-20","9841005004","\u092e\u0928\u093f\u0937\u093e",RBB,"00500000000004",SAK),
  ("ssa-w5-005","SSIS-2081-W05-0005","\u0930\u094b\u091c\u0928 \u0930\u093e\u0908","Rojan Rai","NID-2081-00551",BAL,5,"\u0915\u093f\u0935\u0940 \u092c\u091c\u093e\u0930",PUR,"2079-01-05","9841005005","\u092a\u094d\u0930\u092e\u093f\u0932\u093e",NBL,"00500000000005",SAK),
  ("ssa-w5-006","SSIS-2081-W05-0006","\u092e\u0947\u0918 \u092c\u0939\u093e\u0926\u0941\u0930 \u0924\u093e\u092e\u093e\u0919","Megh Bahadur Tamang","27-01-54-02606",LOP,5,"\u0939\u0947\u0935\u093e \u092e\u093e\u0925\u093f",PUR,"2015-06-12","9841005006","-",NMB,"00500000000006",SAK),
  # WARD 6
  ("ssa-w6-001","SSIS-2081-W06-0001","\u0935\u093f\u0937\u094d\u0923\u0941\u092e\u093e\u092f\u093e \u0905\u0927\u093f\u0915\u093e\u0930\u0940","Vishnumaya Adhikari","27-01-50-02701",J68,6,"\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a \u092c\u091c\u093e\u0930",MAH,"1990-07-11","9841006001","\u0939\u0930\u093f\u092a\u094d\u0930\u0938\u093e\u0926",NPB,"00600000000001",SAK),
  ("ssa-w6-002","SSIS-2081-W06-0002","\u091f\u093f\u0915\u0941 \u092e\u093e\u092f\u093e \u092a\u093e\u0916\u094d\u0930\u093f\u0928","Tiku Maya Pakhrin","27-01-56-02802",EK60,6,"\u0932\u093e\u092a\u094d\u0930\u093e\u0915",MAH,"1997-02-03","9841006002","-",ADB,"00600000000002",SAK),
  ("ssa-w6-003","SSIS-2081-W06-0003","\u0915\u093e\u0928\u094d\u091b\u093e \u0924\u093e\u092e\u093e\u0919","Kanchha Tamang","27-01-53-02903",LOP,6,"\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a \u0924\u0932\u094d\u0932\u094b",PUR,"2016-12-01","9841006003","-",RBB,"00600000000003",NAV),
  ("ssa-w6-004","SSIS-2081-W06-0004","\u0917\u094b\u0930\u0947 \u092e\u0947\u091a\u0947","Gore Meche","27-01-59-03004",J60D,6,"\u0932\u093e\u092a\u094d\u0930\u093e\u0915 \u092e\u093e\u0925\u093f",PUR,"1992-08-12","9841006004","\u092d\u0930\u0924",NMB,"00600000000004",SAK),
  ("ssa-w6-005","SSIS-2081-W06-0005","\u092a\u094d\u0930\u0924\u093f\u092e\u093e \u0916\u0921\u094d\u0915\u093e","Pratima Khadka","NID-2081-00601",BAL,6,"\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a",MAH,"2078-11-07","9841006005","\u0938\u0928\u094d\u0924\u094b\u0937",NBL,"00600000000005",SAK),
  ("ssa-w6-006","SSIS-2081-W06-0006","\u0926\u094d\u0930\u094c\u092a\u0926\u0940 \u0917\u0941\u0930\u0941\u0919","Draupadi Gurung","27-01-61-03106",AKA,6,"\u0932\u093e\u092a\u094d\u0930\u093e\u0915 \u0924\u0932\u094d\u0932\u094b",MAH,"2021-03-15","9841006006","\u0926\u093f\u0932 \u092c\u0939\u093e\u0926\u0941\u0930",NMB,"00600000000006",SAK),
  # WARD 7
  ("ssa-w7-001","SSIS-2081-W07-0001","\u0906\u0919 \u0926\u094b\u0930\u094d\u091c\u0947 \u0936\u0947\u0930\u094d\u092a\u093e","Ang Dorje Sherpa","27-01-45-03101",J68,7,"\u092d\u094b\u091f\u093e\u0919",PUR,"1985-09-05","9841007001","\u0928\u093f\u092e\u093e \u0926\u094b\u0930\u094d\u091c\u0947",NPB,"00700000000001",SAK),
  ("ssa-w7-002","SSIS-2081-W07-0002","\u0932\u0915\u094d\u0937\u094d\u092e\u0940 \u0936\u0947\u0930\u094d\u092a\u093e","Laxmi Sherpa","27-01-57-03202",EK60,7,"\u0938\u0941\u0930\u094d\u0915\u0947",MAH,"1998-04-13","9841007002","-",NMB,"00700000000002",NAV),
  ("ssa-w7-003","SSIS-2081-W07-0003","\u092d\u0941\u0935\u0928 \u0915\u0941\u092e\u093e\u0930 \u0938\u0941\u0928\u093e\u0930","Bhuvan Kumar Sunar","27-01-58-03303",J60D,7,"\u092d\u094b\u091f\u093e\u0919 \u092e\u093e\u0925\u093f",PUR,"1995-07-25","9841007003","\u092c\u0932\u0930\u093e\u092e",ADB,"00700000000003",SAK),
  ("ssa-w7-004","SSIS-2081-W07-0004","\u0938\u094b\u0928\u092e \u0917\u094d\u092f\u093e\u0932\u094d\u091c\u0947\u0928 \u0936\u0947\u0930\u094d\u092a\u093e","Sonam Gyaljen Sherpa","27-01-50-03404",LOP,7,"\u0938\u0941\u0930\u094d\u0915\u0947 \u092c\u0947\u0938\u093f",PUR,"2013-02-01","9841007004","-",RBB,"00700000000004",SAK),
  ("ssa-w7-005","SSIS-2081-W07-0005","\u092a\u0947\u092e\u094d\u092c\u093e \u0932\u094d\u0939\u093e\u092e\u0941 \u0936\u0947\u0930\u094d\u092a\u093e","Pemba Lhamu Sherpa","NID-2081-00701",BAL,7,"\u092d\u094b\u091f\u093e\u0919",MAH,"2079-08-15","9841007005","\u092b\u0941\u0930\u094d\u092c\u093e \u0924\u0947\u0928\u094d\u091c\u093f\u0928",NBL,"00700000000005",SAK),
  ("ssa-w7-006","SSIS-2081-W07-0006","\u0930\u093f\u0924\u093e \u0924\u093e\u092e\u093e\u0919","Rita Tamang","27-01-63-03506",AKHA,7,"\u0938\u0941\u0930\u094d\u0915\u0947",MAH,"2021-09-08","9841007006","\u0928\u0947\u0924\u094d\u0930",NMB,"00700000000006",SAK),
  # WARD 8
  ("ssa-w8-001","SSIS-2081-W08-0001","\u091c\u0917\u094d\u0917 \u092c\u0939\u093e\u0926\u0941\u0930 \u0925\u093e\u092a\u093e","Jagga Bahadur Thapa","27-01-46-03601",J68,8,"\u091c\u094d\u092f\u093e\u092e\u093f\u0930\u0947",PUR,"1986-03-01","9841008001","\u092d\u093f\u092e",NPB,"00800000000001",SAK),
  ("ssa-w8-002","SSIS-2081-W08-0002","\u0938\u092e\u091d\u0928\u093e \u0926\u0947\u0935\u0940 \u092a\u094b\u0916\u0930\u0947\u0932","Samjhana Devi Pokhrel","27-01-53-03702",EK60,8,"\u092b\u0941\u0932\u094d\u092a\u093f\u0919\u0915\u091f\u094d\u091f\u0940",MAH,"1995-11-05","9841008002","-",ADB,"00800000000002",NAV),
  ("ssa-w8-003","SSIS-2081-W08-0003","\u0930\u092e\u0947\u0936 \u092c\u0939\u093e\u0926\u0941\u0930 \u0926\u092e\u093e\u0908","Ramesh Bahadur Damai","27-01-58-03803",J60D,8,"\u091c\u094d\u092f\u093e\u092e\u093f\u0930\u0947 \u092e\u093e\u0925\u093f",PUR,"1992-05-12","9841008003","\u0930\u0918\u0941",RBB,"00800000000003",SAK),
  ("ssa-w8-004","SSIS-2081-W08-0004","\u0932\u093f\u0932\u093e \u092c\u0939\u093e\u0926\u0941\u0930 \u0930\u093e\u0908","Lila Bahadur Rai","27-01-61-03904",AKA,8,"\u092b\u0941\u0932\u094d\u092a\u093f\u0919\u0915\u091f\u094d\u091f\u0940 \u0924\u0932\u094d\u0932\u094b",PUR,"2017-07-03","9841008004","\u0930\u0947\u0936\u092e",NBL,"00800000000004",SAK),
  ("ssa-w8-005","SSIS-2081-W08-0005","\u0938\u0941\u0937\u094d\u092e\u093e \u0924\u093e\u092e\u093e\u0919","Sushma Tamang","NID-2081-00851",BAL,8,"\u091c\u094d\u092f\u093e\u092e\u093f\u0930\u0947",MAH,"2078-03-25","9841008005","\u0930\u092e\u093f\u0932\u093e",NMB,"00800000000005",SAK),
  ("ssa-w8-006","SSIS-2081-W08-0006","\u0939\u093f\u0930\u093e \u092c\u0939\u093e\u0926\u0941\u0930 \u0938\u0941\u0928\u0941\u0935\u093e\u0930","Hira Bahadur Sunuwar","27-01-51-04006",LOP,8,"\u092b\u0941\u0932\u094d\u092a\u093f\u0919\u0915\u091f\u094d\u091f\u0940",PUR,"2012-08-21","9841008006","-",ADB,"00800000000006",SAK),
]

# Vital events - (id, regNo, evType, status, personName, personNameEn, gender, evDate, place, fatherN, motherN, spouseN, applicant, rel, citizen, phone, ward, regDate, issued, registrar, remarks)
J = "\u091c\u0928\u094d\u092e \u0926\u0930\u094d\u0924\u093e"
M = "\u092e\u0943\u0924\u094d\u092f\u0941 \u0926\u0930\u094d\u0924\u093e"
V = "\u0935\u093f\u0935\u093e\u0939 \u0926\u0930\u094d\u0924\u093e"
D = "\u0938\u092e\u094d\u092c\u0928\u094d\u0927 \u0935\u093f\u091a\u094d\u091b\u0947\u0926 \u0926\u0930\u094d\u0924\u093e"
B = "\u092c\u0938\u093e\u0907\u0901\u0938\u0930\u093e\u0908 \u0926\u0930\u094d\u0924\u093e"
OK = "\u092a\u094d\u0930\u092e\u093e\u0923\u092a\u0924\u094d\u0930 \u091c\u093e\u0930\u0940"
DAM = "\u0926\u092e\u094d\u092a\u0924\u0940"
BAB = "\u092c\u093e\u092c\u0941"
SRI = "\u0936\u094d\u0930\u0940\u092e\u093e\u0928"
SRIM = "\u0936\u094d\u0930\u0940\u092e\u0924\u0940"
CHO = "\u091b\u094b\u0930\u093e"
GHR = "\u0918\u0930\u092e\u0942\u0932\u0940"
REG1 = "\u0938\u0941\u092e\u0928 \u092a\u094d\u0930\u0938\u093e\u0926 \u0938\u093e\u092a\u0915\u094b\u091f\u093e"
REG2 = "\u092e\u0928\u094b\u091c \u0915\u0941\u092e\u093e\u0930 \u0936\u094d\u0930\u0947\u0937\u094d\u0920"
REG3 = "\u0915\u092e\u0932\u093e \u0930\u093e\u0908"

VE = [
  ("ve-w1-001","VER-2081-01-0001",J,OK,"\u0906\u092f\u0941\u0937 \u0924\u093e\u092e\u093e\u0919","Ayush Tamang",PUR,"2081-04-15","\u092f\u093e\u0919\u094d\u0917\u094d\u0930\u0940","\u0926\u093e\u0935\u093e \u0924\u093e\u092e\u093e\u0919","\u092a\u0947\u092e\u094d\u092c\u093e \u0932\u094d\u0939\u093e\u092e\u0941",None,"\u0926\u093e\u0935\u093e \u0924\u093e\u092e\u093e\u0919",BAB,"27-01-73-01425","9841001010",1,"2081-04-20","2081-04-20",REG1,"DoNIDCR online"),
  ("ve-w1-002","VER-2081-01-0002",J,OK,"\u092a\u0947\u092e\u094d\u092c\u093e \u0932\u094d\u0939\u093e\u092e\u0941 \u0924\u093e\u092e\u093e\u0919","Pemba Lhamu Tamang",MAH,"2081-02-03","\u0917\u094b\u0932\u092e\u093e\u0922\u0940","\u0938\u094b\u0928\u092e \u0924\u093e\u092e\u093e\u0919","\u0926\u093e\u0935\u093e \u0932\u094d\u0939\u093e\u092e\u0941",None,"\u0938\u094b\u0928\u092e \u0924\u093e\u092e\u093e\u0919",BAB,"27-01-72-02211","9841001011",1,"2081-02-10","2081-02-10",REG1,"Ward 1 Yangri"),
  ("ve-w2-001","VER-2081-02-0001",J,OK,"\u0906\u0915\u093e\u0936 \u0936\u094d\u0930\u0947\u0937\u094d\u0920","Aakash Shrestha",PUR,"2080-12-05","\u092c\u0930\u094d\u0935\u093e","\u0930\u093e\u091c\u0947\u0936 \u0936\u094d\u0930\u0947\u0937\u094d\u0920","\u0938\u0941\u0928\u093f\u0924\u093e \u0936\u094d\u0930\u0947\u0937\u094d\u0920",None,"\u0930\u093e\u091c\u0947\u0936 \u0936\u094d\u0930\u0947\u0937\u094d\u0920",BAB,"27-01-70-05678","9841002010",2,"2081-01-05","2081-01-05",REG2,"Late registration fine Rs.200"),
  ("ve-w3-001","VER-2081-03-0001",J,OK,"\u0905\u0928\u0941\u0937\u094d\u0915\u093e \u0928\u094d\u092f\u094c\u092a\u093e\u0928\u0947","Anushka Neupane",MAH,"2081-01-20","\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a","\u092c\u093f\u0937\u094d\u0923\u0941 \u0928\u094d\u092f\u094c\u092a\u093e\u0928\u0947","\u0926\u0941\u0930\u094d\u0917\u093e \u0926\u0947\u0935\u0940",None,"\u092c\u093f\u0937\u094d\u0923\u0941",BAB,"27-01-74-03301","9841003010",3,"2081-01-25","2081-01-25",REG1,"Normal birth"),
  ("ve-w4-001","VER-2081-04-0001",J,OK,"\u0924\u0947\u0928\u094d\u091c\u093f\u0928 \u0932\u093e\u092e\u093e","Tenzin Lama",PUR,"2081-05-14","\u0925\u093e\u0919\u092a\u093e\u0932\u0916\u0930\u094d\u0915","\u091b\u093f\u0930\u093f\u0919 \u0932\u093e\u092e\u093e","\u0915\u0930\u094d\u092e\u093e\u0919 \u0932\u093e\u092e\u093e",None,"\u091b\u093f\u0930\u093f\u0919 \u0932\u093e\u092e\u093e",BAB,"27-01-75-04401","9841004010",4,"2081-05-20","2081-05-20",REG2,"DoNIDCR system"),
  ("ve-w7-001","VER-2081-07-0001",J,OK,"\u0938\u094b\u0928\u092e \u0936\u0947\u0930\u094d\u092a\u093e","Sonam Sherpa",MAH,"2081-05-02","\u092d\u094b\u091f\u093e\u0919","\u092a\u093e\u0938\u093e\u0919 \u0936\u0947\u0930\u094d\u092a\u093e","\u0906\u0919 \u092b\u0941\u0930\u094d\u0935\u093e",None,"\u092a\u093e\u0938\u093e\u0919",BAB,"27-01-72-03114","9841007010",7,"2081-05-08","2081-05-08",REG3,"Bhotang Ward 7"),
  ("ve-w8-001","VER-2081-08-0001",J,OK,"\u0905\u0938\u094d\u092e\u093f\u0924\u093e \u0925\u093e\u092a\u093e","Asmita Thapa",MAH,"2081-06-10","\u091c\u094d\u092f\u093e\u092e\u093f\u0930\u0947","\u092a\u094d\u0930\u0915\u093e\u0936 \u0925\u093e\u092a\u093e","\u0915\u0932\u094d\u092a\u0928\u093e \u0925\u093e\u092a\u093e",None,"\u092a\u094d\u0930\u0915\u093e\u0936",BAB,"27-01-74-08001","9841008010",8,"2081-06-15","2081-06-15",REG2,"Normal delivery"),
  # Deaths
  ("ve-w1-003","VER-2081-01-0003",M,OK,"\u0938\u094d\u0935. \u0938\u094b\u0928\u092e \u0926\u093e\u092c\u093e \u0924\u093e\u092e\u093e\u0919","Late Sonam Dawa Tamang",PUR,"2081-05-20","\u092f\u093e\u0919\u094d\u0917\u094d\u0930\u0940",None,None,"\u0926\u0947\u0935\u0915\u0940 \u0924\u093e\u092e\u093e\u0919","\u0926\u0947\u0935\u0915\u0940 \u0924\u093e\u092e\u093e\u0919",SRIM,"27-01-68-01312","9841001020",1,"2081-05-28","2081-05-28",REG1,"Age 78, natural"),
  ("ve-w3-002","VER-2081-03-0002",M,OK,"\u0938\u094d\u0935. \u092a\u093e\u0930\u094d\u0935\u0924\u0940 \u0926\u0947\u0935\u0940 \u092a\u093e\u0923\u094d\u0921\u0947","Late Parvati Devi Pande",MAH,"2081-04-01","\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a",None,None,"\u0939\u0930\u093f \u092a\u093e\u0923\u094d\u0921\u0947","\u0939\u0930\u093f \u092a\u093e\u0923\u094d\u0921\u0947",SRI,"27-01-65-03224","9841003020",3,"2081-04-07","2081-04-07",REG1,"Age 70, illness"),
  ("ve-w6-001","VER-2081-06-0001",M,OK,"\u0938\u094d\u0935. \u0915\u093e\u0928\u094d\u091b\u093e \u0924\u093e\u092e\u093e\u0919","Late Kanchha Tamang",PUR,"2081-06-05","\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a",None,None,"\u092a\u0941\u0928\u0941 \u0924\u093e\u092e\u093e\u0919","\u0938\u0941\u092c\u094d\u092c\u093e \u0924\u093e\u092e\u093e\u0919",CHO,"27-01-65-02891","9841006020",6,"2081-06-12","2081-06-12",REG2,"Ward 6 Thangpaldhap"),
  ("ve-w7-002","VER-2081-07-0002",M,OK,"\u0938\u094d\u0935. \u0906\u0919 \u0930\u093f\u0924\u093e \u0936\u0947\u0930\u094d\u092a\u093e","Late Ang Rita Sherpa",PUR,"2081-07-15","\u092d\u094b\u091f\u093e\u0919",None,None,"\u092f\u093e\u0928\u094d\u091c\u0947\u0928 \u0936\u0947\u0930\u094d\u092a\u093e","\u092f\u093e\u0928\u094d\u091c\u0947\u0928 \u0936\u0947\u0930\u094d\u092a\u093e",SRIM,"27-01-68-07215","9841007020",7,"2081-07-20","2081-07-20",REG3,"Age 73, hypertension"),
  # Marriages
  ("ve-w2-002","VER-2081-02-0002",V,OK,"\u0930\u093e\u091c\u0947\u0936 \u0917\u093f\u0930\u0940 \u0930 \u0938\u0941\u0928\u093f\u0924\u093e \u0936\u094d\u0930\u0947\u0937\u094d\u0920","Rajesh Giri & Sunita Shrestha",DAM,"2081-02-11","\u092c\u0930\u094d\u0935\u093e","\u0938\u0942\u0930\u094d\u092f \u092c\u0939\u093e\u0926\u0941\u0930 \u0917\u093f\u0930\u0940","\u0915\u092e\u0932\u093e \u0917\u093f\u0930\u0940",None,"\u0930\u093e\u091c\u0947\u0936 \u0917\u093f\u0930\u0940",SRI,"27-01-70-05678","9841002015",2,"2081-02-14","2081-02-14",REG2,"Ward 2 Barwa"),
  ("ve-w5-002","VER-2081-05-0002",V,OK,"\u0935\u093f\u0928\u094b\u0926 \u0915\u093e\u0930\u094d\u0915\u0940 \u0930 \u0930\u0940\u0928\u093e \u0918\u0930\u094d\u0924\u0940","Binod Karki & Rina Gharti",DAM,"2080-11-25","\u0915\u093f\u0935\u0940","\u091f\u0947\u0915 \u092c\u0939\u093e\u0926\u0941\u0930 \u0915\u093e\u0930\u094d\u0915\u0940","\u092e\u0928\u093f\u0937\u093e \u0915\u093e\u0930\u094d\u0915\u0940",None,"\u0935\u093f\u0928\u094b\u0926 \u0915\u093e\u0930\u094d\u0915\u0940",SRI,"27-01-71-05511","9841005015",5,"2080-12-03","2080-12-03",REG1,"Social marriage"),
  ("ve-w8-003","VER-2081-08-0003",V,OK,"\u0905\u092e\u0930 \u0925\u093e\u092a\u093e \u0930 \u0938\u0930\u094b\u091c \u0925\u093e\u092a\u093e","Amar Thapa & Saroj Thapa",DAM,"2081-04-25","\u091c\u094d\u092f\u093e\u092e\u093f\u0930\u0947","\u0917\u094b\u092a\u093e\u0932 \u0925\u093e\u092a\u093e","\u092a\u093e\u0930\u094d\u0935\u0924\u0940 \u0925\u093e\u092a\u093e",None,"\u0905\u092e\u0930 \u0925\u093e\u092a\u093e",SRI,"27-01-73-08315","9841008015",8,"2081-04-30","2081-04-30",REG2,"Ward 8 Jyamire"),
  # Migrations
  ("ve-w4-002","VER-2081-04-0002",B,OK,"\u0930\u093e\u092e \u092c\u0939\u093e\u0926\u0941\u0930 \u092a\u0923\u094d\u0921\u093f\u0924 (5 members)","Ram Bahadur Pandit",PUR,"2081-03-21","\u0925\u093e\u0919\u092a\u093e\u0932\u0916\u0930\u094d\u0915","\u0939\u0930\u093f \u092a\u0923\u094d\u0921\u093f\u0924","\u0938\u0940\u0924\u093e \u092a\u0923\u094d\u0921\u093f\u0924",None,"\u0930\u093e\u092e \u092c\u0939\u093e\u0926\u0941\u0930",GHR,"27-01-68-00912","9841004025",4,"2081-03-25","2081-03-25",REG2,"Out-migration to Melamchi"),
  ("ve-w3-003","VER-2081-03-0003",B,OK,"\u092e\u0928\u094b\u091c \u0905\u0927\u093f\u0915\u093e\u0930\u0940 (3 members)","Manoj Adhikari",PUR,"2081-02-05","\u0925\u093e\u0919\u092a\u093e\u0932\u0922\u093e\u092a","\u0939\u0930\u093f \u0905\u0927\u093f\u0915\u093e\u0930\u0940","\u0915\u093e\u0928\u094d\u091b\u0940 \u0905\u0927\u093f\u0915\u093e\u0930\u0940",None,"\u092e\u0928\u094b\u091c \u0905\u0927\u093f\u0915\u093e\u0930\u0940",GHR,"27-01-72-03318","9841003025",3,"2081-02-09","2081-02-09",REG1,"In-migration from Sindhupalchok"),
  # Divorces
  ("ve-w5-003","VER-2081-05-0003",D,OK,"\u0915\u0943\u0937\u094d\u0923 \u092a\u093e\u0923\u094d\u0921\u0947 \u0930 \u0938\u093e\u0935\u093f\u0924\u094d\u0930\u0940 \u092a\u093e\u0923\u094d\u0921\u0947","Krishna Pande & Savitri Pande",DAM,"2081-03-01","\u0915\u093f\u0935\u0940",None,None,None,"\u0915\u0943\u0937\u094d\u0923 \u092a\u093e\u0923\u094d\u0921\u0947",SRI,"27-01-69-05515","9841005030",5,"2081-03-08","2081-03-08",REG1,"Court divorce order"),
  ("ve-w8-004","VER-2081-08-0004",D,OK,"\u0938\u0941\u092e\u0928 \u0930\u093e\u0908 \u0930 \u092e\u093f\u0928\u093e \u0930\u093e\u0908","Suman Rai & Mina Rai",DAM,"2080-12-10","\u091c\u094d\u092f\u093e\u092e\u093f\u0930\u0947",None,None,None,"\u0938\u0941\u092e\u0928 \u0930\u093e\u0908",SRI,"27-01-71-08421","9841008030",8,"2080-12-17","2080-12-17",REG2,"District court order"),
]

RATES = {J68:4000,J60D:2660,EK60:2660,AKA:3990,AKHA:2128,BAL:532,LOP:3990}

def seed_ssa(conn):
    cur = conn.cursor()
    ins = skip = 0
    for b in SSA:
        bid,bname,bname_en,cit,cat,ward,tole,gen,dob,ph,grd,bnk,acct,st = b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8],b[9],b[10],b[11],b[12],b[13],b[14]
        monthly = RATES.get(cat,4000.0)
        try:
            cur.execute("""INSERT INTO social_security_beneficiaries
                (tenant_id,id,"beneficiaryId","fullName","fullNameEn","citizenshipOrNidNo",
                 category,"wardNumber","toleVillage",gender,"dateOfBirthBs","contactPhone",
                 "guardianName","bankName","bankAccountNo","monthlyAllowanceNPR",
                 "quarterlyAllowanceNPR",status,"fiscalYear","renewalDateBs","createdAt","updatedAt")
                VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
                ON CONFLICT DO NOTHING""",
                (TENANT_ID,b[0],bid,bname,bname_en,cit,cat,ward,tole,gen,dob,ph,grd,bnk,acct,float(monthly),float(monthly)*3,st,FY,REN))
            if cur.rowcount>0: ins+=1; print(f"  OK SSA: {bid} Ward {ward}")
            else: skip+=1
        except Exception as e: print(f"  ERR SSA {b[0]}: {e}"); conn.rollback(); cur=conn.cursor()
    conn.commit(); cur.close()
    print(f"  SSA: {ins} inserted, {skip} skipped")

def seed_vital(conn):
    cur = conn.cursor()
    ins = skip = 0
    for ev in VE:
        try:
            cur.execute("""INSERT INTO vital_events
                (tenant_id,id,"registrationNo","eventType",status,"personName","personNameEn",
                 gender,"eventDateBs","eventPlace","fatherName","motherName","spouseName",
                 "applicantName","applicantRelation","applicantCitizenship","applicantPhone",
                 "wardNumber","registrationDateBs","issuedDateBs","registrarName",remarks,"createdAt","updatedAt")
                VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
                ON CONFLICT DO NOTHING""",
                (TENANT_ID,ev[0],ev[1],ev[2],ev[3],ev[4],ev[5],ev[6],ev[7],ev[8],ev[9],ev[10],ev[11],ev[12],ev[13],ev[14],ev[15],ev[16],ev[17],ev[18],ev[19],ev[20]))
            if cur.rowcount>0: ins+=1; print(f"  OK VE: {ev[1]} ({ev[2]})")
            else: skip+=1
        except Exception as e: print(f"  ERR VE {ev[0]}: {e}"); conn.rollback(); cur=conn.cursor()
    conn.commit(); cur.close()
    print(f"  VitalEvents: {ins} inserted, {skip} skipped")

def verify(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM social_security_beneficiaries")
    print(f"\nSSA Total: {cur.fetchone()[0]}")
    cur.execute('SELECT COUNT(*),"wardNumber" FROM social_security_beneficiaries GROUP BY "wardNumber" ORDER BY "wardNumber"')
    for r in cur.fetchall(): print(f"  Ward {r[1]}: {r[0]}")
    cur.execute("SELECT COUNT(*) FROM vital_events")
    print(f"\nVital Events Total: {cur.fetchone()[0]}")
    cur.execute('SELECT COUNT(*),"eventType" FROM vital_events GROUP BY "eventType"')
    for r in cur.fetchall(): print(f"  {r[1]}: {r[0]}")
    cur.close()

if __name__=="__main__":
    print("="*55)
    print("  Option 10: SSA & Vital Registration Seed")
    print("  Panchpokhari Thangpal Gaupalika")
    print("="*55)
    try:
        conn = psycopg2.connect(DB_URI)
        print("DB Connected")
    except Exception as e:
        print(f"DB Error: {e}"); sys.exit(1)
    print("\n--- SSA Beneficiaries ---")
    seed_ssa(conn)
    print("\n--- Vital Events ---")
    seed_vital(conn)
    print("\n--- Verification ---")
    verify(conn)
    conn.close()
    print("\nDone!")