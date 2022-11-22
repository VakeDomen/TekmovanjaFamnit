public class Fleet {
    String name;
    int size;
    String origP;
    String destP;
    int currT;
    int needT;

    public Fleet(String name, String size, String origP, String destP, String currT, String needT) {
        this.name = name;
        this.size = Integer.parseInt(size);
        this.origP = currT;
        this.destP = destP;
        this.currT = Integer.parseInt(currT);
        this.needT = Integer.parseInt(needT);
    }

    public String getName() {
        return name;
    }

    public int getCurrT() {
        return currT;
    }

    public String getDestP() {
        return destP;
    }

    public int getNeedT() {
        return needT;
    }

    public String getOrigP() {
        return origP;
    }

    public int getSize() {
        return size;
    }
}
